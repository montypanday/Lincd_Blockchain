﻿using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using Database.Services;
using front_end.Models;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Auth.OAuth2.Flows;
using Google.Apis.Auth.OAuth2.Responses;
using Google.Apis.Drive.v3;
using DriveData = Google.Apis.Drive.v3.Data;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Model;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace front_end.Controllers
{
    [Route("api/[controller]")]
    public class GoogleController : Controller
    {
        public IConfiguration Configuration { get; set; }
        IDataProtector _protector { get; set; }
        private readonly ILogger _logger;

        public GoogleController(IConfiguration config, IDataProtectionProvider provider, ILogger<BoxController> logger)
        {
            Configuration = config;
            _protector = provider.CreateProtector(GetType().FullName);
            _logger = logger;
        }

        private ClientSecrets GetClientSecrets() => new ClientSecrets() { ClientId = Configuration["GoogleClientID"], ClientSecret = Configuration["GoogleClientSecret"] };

        private UserCredential GetUserCredentials()
        {
            string Cookie = Request.Cookies["GoogleCred"];
            Cookie = _protector.Unprotect(Cookie);
            TokenResponse tokenResponse = JsonConvert.DeserializeObject<TokenResponse>(Cookie);
            return new UserCredential(
                new GoogleAuthorizationCodeFlow
                (
                     new GoogleAuthorizationCodeFlow.Initializer
                     {
                         ClientSecrets = GetClientSecrets()
                     }
                ),
                "user", tokenResponse);
        }
        private DriveService GetService()
        {
            UserCredential credential = GetUserCredentials();
            return new DriveService(new Google.Apis.Services.BaseClientService.Initializer()
            {
                HttpClientInitializer = credential,
                ApplicationName = "LINCD-Blockchain"
            });
        }

        [Route("Authenticate")]
        [HttpGet]
        public async Task<LocalRedirectResult> Authenticate(string code)
        {
            HttpClient client = new HttpClient();
            _logger.LogWarning("I was redirected");
            HttpResponseMessage response = await client.PostAsync("https://www.googleapis.com/oauth2/v4/token?code=" + code + "&client_id=" + Configuration["GoogleClientID"] + "&redirect_uri=" + Configuration["GoogleRedirectURL"] + "&client_secret=" + Configuration["GoogleClientSecret"] + "&grant_type=authorization_code", new StringContent(""));
            //TokenResponse token = new TokenResponse() { };
            string tokenString = await response.Content.ReadAsStringAsync();
            _logger.LogInformation(tokenString);

            if (response.IsSuccessStatusCode)
            {
                CookieOptions options = new CookieOptions
                {
                    Path = "/api/Google",
                    Expires = DateTime.Now.AddDays(1),
                    HttpOnly = true
                };
                TokenResponse tokenresponse = JsonConvert.DeserializeObject<TokenResponse>(tokenString);

                Response.Cookies.Append("GoogleCred", _protector.Protect(JsonConvert.SerializeObject(tokenresponse)), options);
            }
            return LocalRedirect("/driveExplorer");
        }

        [Route("GetFolderItems/{id}")]
        [HttpGet]
        public IActionResult GetFolderItems(string id)
        {
            DriveService service = GetService();
            _logger.LogInformation("Getting Folder items for Folder -> " + id);
            return GetGoogleFolderItems(service, id);
        }

        [Route("Upload/{currentFolderID}")]
        [HttpPost]
        public IActionResult Upload(string currentFolderID)
        {
            var service = GetService();

            var files = Request.Form.Files;
            foreach (var file in files)
            {
                var filename = ContentDispositionHeaderValue
                                .Parse(file.ContentDisposition)
                                .FileName
                                .Trim('"');

                int bufferSize = 4096;
                using (FileStream fs = System.IO.File.Create(filename, bufferSize, FileOptions.DeleteOnClose))
                {
                    file.CopyTo(fs);
                    var fileMetadata = new Google.Apis.Drive.v3.Data.File()
                    {
                        Name = filename,
                        Parents = new List<string>() { currentFolderID }
                    };
                    FilesResource.CreateMediaUpload request;

                    request = service.Files.Create(fileMetadata, fs, file.ContentType);
                    request.Fields = "id";
                    //request.ProgressChanged += Upload_ProgressChanged;
                    //request.ResponseReceived += Upload_ResponseReceived;
                    request.Upload();

                    Task.Run(() => { RecordFileAction(request.ResponseBody.Id, "Upload"); });
                }
            }
            return GetGoogleFolderItems(service, currentFolderID);

        }

        [Route("Search/{query}")]
        [HttpGet]
        public IActionResult Search(string query)
        {
            var service = GetService();
            FilesResource.ListRequest request = service.Files.List();
            request.PageSize = 100;
            request.PrettyPrint = true;
            request.Q = "name contains '" + query + "' and trashed = false";
            request.Fields = @"files(id,name,kind,md5Checksum,modifiedTime,mimeType,iconLink,size)";
            IList<Google.Apis.Drive.v3.Data.File> files = request.Execute().Files;
            return Json(ConvertToSend(files));
        }

        [Route("NewFolder/{parentID}/{name}")]
        [HttpGet]
        public IActionResult NewFolder(string parentID, string name)
        {
            var service = GetService();
            var newFolder = new Google.Apis.Drive.v3.Data.File()
            {
                Name = name,
                Parents = new List<string>() { parentID },
                MimeType = "application/vnd.google-apps.folder"
            };
            var request = service.Files.Create(newFolder);
            var verify = request.Execute();
            if (verify.Name == name)
            {
                return GetGoogleFolderItems(service, parentID);
                //return StatusCode(200);
            }
            return StatusCode(500);
        }

        [Route("Delete/{id}/{currentFolderID}")]
        [HttpGet]
        public IActionResult Delete(string id, string currentFolderID)
        {
            var service = GetService();
            Task.Run(() => { RecordFileAction(id, "Delete"); });

            var deleterequest = service.Files.Delete(id);
            var verify = deleterequest.Execute();

            return GetGoogleFolderItems(service, currentFolderID);
        }

        [Route("GetPreview/{id}")]
        [HttpGet]
        public IActionResult GetPreview(string id)
        {
            return Json("https://docs.google.com/viewer?srcid=" + id + "&pid=explorer&efh=false&a=v&chrome=false&embedded=true");
        }

        [Route("Rename/{newName}/{uid}/{currentFolderID}/{type}")]
        [HttpGet]
        public IActionResult Rename(string newName, string uid, string currentFolderID, string type)
        {

            var service = GetService();
            DriveData.File file = new DriveData.File()
            { 
                Name = newName
            };
            //if (type == "file")
            //{
            var request = service.Files.Update(file, uid);
            var response = request.Execute();
            return GetGoogleFolderItems(service, currentFolderID);
            //BoxFile fileAfterRename = await client.FilesManager.UpdateInformationAsync(new BoxFileRequest() { Id = uid, Name = newName });
            //}
            //else if (type == "folder")
            //{
            //    //BoxFolder boxFolder = await client.FoldersManager.UpdateInformationAsync(new BoxFolderRequest() { Id = uid, Name = newName });
            //}

            //Task.Run(() => { RecordFileAction(client, uid, "Rename"); });
            //return await GetBoxFolderItems(client, currentFolderID);

        }

        [Route("GetSharedLink/{type}/{id}")]
        [HttpGet]
        public IActionResult GetSharedLink(string type, string id)
        {
            var service = GetService();
            var request = service.Files.Get(id);
            var response = request.Execute();
            return Json(response);

        }

        private Content[] ConvertToSend(IList<Google.Apis.Drive.v3.Data.File> files)
        {
            Content[] list = new Content[files.Count];
            for (int i = 0; i < files.Count; i++)
            {
                Content cont = new Content();
                cont.Type = files[i].MimeType == "application/vnd.google-apps.folder" ? "folder" : "file";
                cont.Id = files[i].Id;
                cont.FileName = files[i].Name;
                cont.Size = files[i].Size.GetValueOrDefault().ToString();
                cont.Hash = files[i].Md5Checksum;
                cont.LastModified = files[i].ModifiedTime.ToString();
                cont.MimeType = files[i].MimeType;
                list[i] = cont;
            }
            return list;
        }

        private IActionResult GetGoogleFolderItems(DriveService service, string id)
        {
            FilesResource.ListRequest request = service.Files.List();
            request.PageSize = 100;
            request.PrettyPrint = true;
            if (id == "'sharedWithMe'" || id == "sharedWithMe")
            {
                request.Q = "sharedWithMe = true and trashed = false";
            }
            else
            {
                if (id == "root" || id == "''root''") { id = "'root'"; }
                else
                {
                    id = "'" + id + "'";
                }
                request.Q = id + " in parents and trashed = false";
            }

            //request.Fields = @"files(*)";
            request.Fields = @"files(id,name,kind,md5Checksum,modifiedTime,mimeType,size)";
            IList<DriveData.File> files = request.Execute().Files;
            return Json(ConvertToSend(files));
        }

        private DriveData.File GetDriveFile(string id)
        {
            DriveService service = GetService();
            FilesResource.GetRequest request = service.Files.Get(id);
            DriveData.File file = request.Execute();
            return file;
        }

        private void RecordFileAction(string fileID, string actionType)
        {
            DriveService service = GetService();
            FileActionService fileActionService = new FileActionService();

            DriveData.File file = GetDriveFile(fileID);
            AboutResource.GetRequest request = service.About.Get();
            request.Fields = "user(emailAddress)";
            string userID = request.Execute().User.EmailAddress;

            FileAction action = new FileAction(
                fileID,
                file.Md5Checksum,
                "Google Drive",
                userID,
                actionType,
                DateTime.Now);

            fileActionService.RecordFileAction(action);
        }



    }
}
