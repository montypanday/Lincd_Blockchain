﻿using MySql.Data.MySqlClient;
using System;
using System.Data;

namespace Database
{
    public class ConnectionProvider
    {
        private MySqlConnection connection;

        public ConnectionProvider()
        {
            Initialize();
        }

        private void Initialize()
        {
            MySqlConnectionStringBuilder connectionString = new MySqlConnectionStringBuilder
            {
                Server = "localhost",
                Database = "docchain",
                UserID = "root",
                Password = "Lincd"
            };
            connection = new MySqlConnection(connectionString.ToString());
        }

        public IDbConnection Get()
        {
            return connection;
        }

        public bool Open()
        {
            try
            {
                connection.Open();
                return true;
            }
            catch (MySqlException e)
            {
                switch (e.Number)
                {
                    case 0:
                        Console.WriteLine("Cannot connect to server.  Contact administrator");
                        break;

                    case 1045:
                        Console.WriteLine("Invalid username/password, please try again");
                        break;
                }
                return false;
            }
        }

        public bool Close()
        {
            try
            {
                connection.Close();
                return true;
            }
            catch (MySqlException e)
            {
                Console.WriteLine(e.Message);
                return false;
            }
        }
    }
}