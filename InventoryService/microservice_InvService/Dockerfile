# Etapa 1: build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY *.csproj ./
RUN dotnet restore ./microservice_InvService.csproj

COPY . .
RUN dotnet publish ./microservice_InvService.csproj -c Release -o /app/publish

# Etapa 2: runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 5070
ENTRYPOINT ["dotnet", "microservice_InvService.dll"]
