# Use the desired base image
FROM christoftorres/confuzzius

# Container's working directory
WORKDIR /root

# Copy the contracts and libraries into the running container (Dockerfile is inside confuzzius folder, hence we need ../)
COPY contracts ./contracts
COPY ../node_modules/\@openzeppelin ./\@openzeppelin

# Create a Python script to install the correct compiler version
RUN echo $'\
import solcx\n\
\n\
solcx.install_solc("v0.8.25")\n\
' > /root/install-solc.py

# Install the compiler
RUN python3 /root/install-solc.py