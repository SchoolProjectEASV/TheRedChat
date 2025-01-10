# The Red Chat

## Authors

- [@Mathias](https://github.com/MathiasKrarup)
- [@Andreas](https://github.com/AndreasBerthelsen)
- [@Jens](https://github.com/JensIssa)


## Introduction
The Red Chat incorporates essential security features, including end-to-end encryption, to ensure that messages exchanged between users remain private and secure. By prioritizing user privacy and data protection, the application aims to provide a safe and reliable platform for secure digital communication.
### Prerequisites
The Prerequisites assume you have [Docker](https://www.docker.com/) 

To be able to run our program you need to create 2 ```.env``` files, one in the ```TheRedChat``` folder, and one in the ```TheRedChat\Backend```.
This is the structure you should follow, in your ```.env``` file
```
ConnectionStrings__DefaultConnection=Server=your-server;Database=your-database;User Id=your-username;Password=your-password;TrustServerCertificate=True;
JwtSettings__SecretKey=your-secret-key
MSSQL_SA_PASSWORD=your-password
```

In addition you also need to create an ```appsettings.json``` file in ```TheRedChat\Backend\TheRedChat```.
The structure should be like this:
```
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=your-server;Database=your-database;User Id=your-username;Password=your-password;TrustServerCertificate=True;"
  },
  "JwtSettings": {
    "PublicKey": "your-public-key",
    "PrivateKey": "your-private-key",
    "Issuer": "your-issuer",
    "Audience": "your-audience"
  }
}
```
### How to run the application
Use the following command to run the application:
```
docker compose up --build
```
This command builds and starts the application using Docker Compose.

Then navigate to:
[http://localhost:4200/](http://localhost:4200/)

# Showcase of the application
### Login screen
![image](https://github.com/user-attachments/assets/45cf69a8-ae59-45ac-8103-cc46592775b1)

### Registre screen
![image](https://github.com/user-attachments/assets/16d7337e-8d1b-495f-8666-6e6307e36bef)

### Enter Primary key, that you get after registering
![image](https://github.com/user-attachments/assets/e59e2f65-08b0-4235-b050-332e5e17dd90)

### Chat between 2 users
![image](https://github.com/user-attachments/assets/2badbd3e-cdcd-405f-8f92-7fdb61750cde)

