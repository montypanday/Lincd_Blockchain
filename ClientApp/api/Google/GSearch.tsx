﻿import { formatSizeUnits } from '../Helpers/FormatSize';

export function GSearch(query: string) {
    //this is the network call made everytime the page is reload, before the render method.
    return fetch("/api/Google/Search/" + query, { credentials: 'same-origin' })
        .then(response => {
            if (!response.ok) { throw response; }
            return response.json()  //we only get here if there is no error)
        })
        .then(data => {
            var newData = [];
            for (var i = 0; i < data.length; i++) {
                var a = {};
                if (data[i].mimeType == "application/vnd.google-apps.folder") {
                    //console.log(data.entries[i].type);
                    a = {
                        type: "folder",
                        id: data[i].id,
                        fileName: data[i].fileName,
                        size: formatSizeUnits(data[i].size),
                        hash: "",
                        lastModified: data[i].lastModified,
                        embedLink: "",
                        downloadUrl: "",
                        mimeType: data[i].mimeType,
                        iconLink: data[i].iconLink
                    };
                }
                else {
                    a = {
                        type: data[i].type,
                        id: data[i].id,
                        fileName: data[i].fileName,
                        size: formatSizeUnits(data[i].size),
                        hash: data[i].hash,
                        lastModified: data[i].lastModified,
                        embedLink: "https://docs.google.com/viewer?srcid=" + data[i].id + "&pid=explorer&efh=false&a=v&chrome=false&embedded=true",
                        downloadUrl: data[i].webContentLink,
                        mimeType: data[i].mimeType,
                        iconLink: data[i].iconLink
                    };
                }
                newData.push(a)
            }
            return newData;
        });
}
