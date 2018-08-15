echo "Creating Docker Image"
docker build -t 'robodia' - < Dockerfile
echo "Retrieving Installed Docker Images"
docker images