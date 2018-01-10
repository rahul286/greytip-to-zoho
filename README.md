# greytip-to-zoho
GreytipHR payroll excel file to Zoho Books vendor bills CSV file converter

[GreytipHR](https://www.greythr.com/)
[Zoho Books](https://www.zoho.com/in/books/)

## Usage

Command Line

```
git clone https://github.com/rahul286/greytip-to-zoho/
cd greytip-to-zoho
npm install
node exec /path/to/greytip-hr-payroll-file.xls [optional-outfile-path.csv]
```

## TODO

 - [ ] This script is opinionated towards rtCamp's chart of accounts setup. Our accounts are currently hardcoded. Make it configurable.

## Meta

```
# changes
git commit
# bump version
npm version [minor|major|patch]
```

## electron

Run electron app directly from CLI

```
yarn start
```

Build MacOS dmg

```
yarn dist
```
