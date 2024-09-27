<div align="center">
  <img src="./assets/logo.png" alt="Logo" width="150"/>

  # Blockchain Manager

  ![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
  ![Version 0.1](https://img.shields.io/badge/version-0.1-green.svg)
  ![Status: Stable](https://img.shields.io/badge/status-stable-brightgreen.svg)
    
  <p>
     This branch proposes a <strong>client-server</strong> architecture for integrating the <strong>Blockchain Manager</strong> component to other modules, with the aim of supporting crypto-asset rewards for human reviewers.
  </p>

</div>

## Table of Contents

- [Installation](#installation)
  - [Prerequisites](#requirements)
  - [Setup](#setup)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Installation

### Requirements

Before starting, ensure you have Docker and Git installed on your system.

### Setup

1. **Clone this repository**.

	```bash
	git clone --branch integration https://github.com/ngi-indi/module-blockchain.git
	```

2. **Create the ```server/secrets.json``` file**.

	```json
	{
		"bscscanApiKey": "yourKey",
		"bscPrivateKey": "yourKey key goes here"
	}
	```

2. **Create the ```.env``` file similar to the following one**.

	```
	# Passphrases:
	PRIVATE_KEY_1="a million miles away your signal in the distance to whom it"
	PRIVATE_KEY_2="may concern I think I lost my way getting good at starting"
	PRIVATE_KEY_3="over every time that I return learning to walk again I believe"
	PRIVATE_KEY_4="I ve waited long enough where do I begin learning to talk"
	PRIVATE_KEY_5="again cant you see I ve waited long enough where do I"

	# hevm (forge's git configuration)
	GIT_EMAIL="your@email.com"
	GIT_USERNAME="your-username"
	```

	For development details please refer to the comments on this README.

	<!-- 
	@dev:
	Currently the server uses only PRIVATE_KEY_1,
	but for more actions performed by different entities (hence private keys), it will require more.
	Proposal: the client **securely** sends its private key to the server
	-->

## Usage
Run the server and client Docker containers.

	```bash
	docker-compose up --build
	```


## Contributing

### Reporting bugs and requesting features
- If you find a bug, please open an issue.
- To request a feature, feel free to open an issue as well.

### Developing a new feature

1. **Fork the repository** by clicking the "Fork" button at the top right of this page.
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/ngi-indi/module-bias-manager.git
   ```
3. **Create a new branch** for your feature or bug fix:
   ```bash
   git checkout -b feature-branch
   ```
4. **Make your changes.** Please follow the existing code style and conventions.
5. **Commit your changes** with a descriptive commit message:
   ```bash
   git commit -m "Add new feature: explanation of bias model predictions"
   ```
6. **Push to your fork**:
   ```bash
   git push origin feature-branch
   ```
7. **Open a pull request** from your fork’s branch to the main branch of this repository.
- Describe the changes you’ve made in the PR description.
- Ensure that your PR references any relevant issues.

## License
This project is licensed under the GNU General Public License v3.0 License - see the [LICENSE](https://github.com/ngi-indi/module-blockchain/blob/main/LICENSE) file for details.

## Contact
For any questions or support, please reach out to:
- University of Cagliari: bart@unica.it, diego.reforgiato@unica.it, ludovico.boratto@unica.it, mirko.marras@unica.it
- R2M Solution: giuseppe.scarpi@r2msolution.com
- Website: Coming soon!