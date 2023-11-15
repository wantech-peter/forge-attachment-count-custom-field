# Attachment Count Custom Field

[![Atlassian license](https://img.shields.io/badge/license-Apache%202.0-blue.svg?style=flat-square)](LICENSE) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)

This simple Forge app adds an Attachment Count custom field that you can configure on your issue screens in classic projects.
The field displays the current number of attachments on the issue. 
The purpose of the app is to demonstrate how to create read-only (calculated) custom fields using the 
 [Jira custom field Forge extension point](https://developer.atlassian.com/platform/forge/manifest-reference/#jira-custom-field).

## Usage

* Go the the list of custom fields
* Find the "Attachment Count" custom field
* Click on the three dots and then select "Associate to Screens"
* Check the screens you wish to use the field on and save

Invoke the `web-trigger-attachments-setup` [web trigger](https://developer.atlassian.com/platform/forge/web-trigger-events-reference/) to initialize the custom field.

If you have more than 1k issues, you need to do pagination: first call the trigger for the first 1k issues, then for another 1k, and so on. 
You can control which page is processed by sending the JSON body to the trigger, like this:

```bash
curl -X POST <web-trigger-url> -H "Content-Type: application/json" -d '{"startAt":0, "maxResults": 1000}' 
```  

The response of the trigger contains information about the page that was processed (the total count of issues), 
so you can write a loop that invokes subsequent pages until there are no more issues to process left.

## Installation

If this is your first time using Forge, the [getting started](https://developer.atlassian.com/platform/forge/set-up-forge/) 
guide will help you install the prerequisites.

If you already have a Forge environment setup you can deploy this example straight away. 
Visit our [example apps](https://developer.atlassian.com/platform/forge/example-apps/) page for installation steps.

## Documentation

The app consists of three elements defined in the `manifest.yaml` file:

* [Custom field](https://developer.atlassian.com/platform/forge/manifest-reference/#jira-custom-field) `attachments`.
* [Web trigger](https://developer.atlassian.com/platform/forge/web-trigger-events-reference/) `web-trigger-attachments-setup` that should be used to set the initial value of the field on all issues.
* [Product trigger](https://developer.atlassian.com/platform/forge/product-events-reference/) `product-trigger-on-issue-update` that updates the value of the field whenever an issue is created or updated.

Note that updating the field's value is achieved through using [public REAST API](https://developer.atlassian.com/cloud/jira/platform/rest/v2/api-group-issue-custom-field-values--apps-/).

Prior deploying you need to set a `FIELD_KEY` [environment variable](https://developer.atlassian.com/platform/forge/environments/) in the following format:
```
{app-id-uuid}__{environment}__{extension-key}
```
For example:
```
forge variables:set FIELD_KEY "f0abfbad-5b05-434e-8a0e-b8dd6aad12d4__DEVELOPMENT__attachments"
```

## Contributions

Contributions to Forge Attachment Count Custom Field are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details. 

## License

Copyright (c) 2020 Atlassian and others.
Apache 2.0 licensed, see [LICENSE](LICENSE) file.
