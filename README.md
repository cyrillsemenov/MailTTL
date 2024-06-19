# Mail TTL

This project contains a script to manage Gmail labels and threads based on Time-to-Live (TTL) prefixes. It uses Google Apps Script to filter and process emails according to specified TTL labels.

### Setup

To set up and deploy this project using clasp and TypeScript, follow these steps:

```sh
# Clone the repository
git clone https://github.com/cyrillsemenov/MailTTL
cd MailTTL
# Install clasp
npm i -g @google/clasp -g
# Install dependencies
npm i
# Authenticate with Google
clasp login
# Create a new Google Apps Script project
clasp create --type standalone --title "Gmail TTL Processor"
# Build and push the script
clasp push
```

### Usage

Configure project in your GCP:

- Setup consent screen
- Enable `Gmail API`

Carefully set up your filters in Gmail and label them accordingly. Use labels in the following format:

- `TTL: 1 month` - This label will **delete** emails older than _1 month_.
- `TTR: 2 weeks` - This label will **mark emails as read** if they are older than _2 weeks_.
- Supported units are `day`, `week`, `month`, and `year`.

Use the Google Apps Script editor to deploy the script as needed (e.g., set up triggers).

- Choose which function to run: `main`
- Choose which deployment should run: `Head`
- Select event source: `Time-driven`
- Select type of time based trigger: `Day timer`
- Select time of day: `Midnight to 1am`

# License

This project is licensed under the MIT License. See the LICENSE file for details.
