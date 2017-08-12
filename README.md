# Subterra
*From Latin Sub Terra ("Under Earth; Underground; Layer below your application").*

Subterra is a free, open-source and lightweight content management system. Running on Node.js and MySQL.
Officially made for a school project, but converted to a downloadable npm-package and made public for everyone to implement in their projects.

## Table of contents
- [Features](#features)
- [Installation](#installation)
- [Setup](#setup)
  - [Server environment](#server-environment)
  - [File-structure](#file-structure)
  - [Files to add](#files-to-add)
- [Acces Subterra](#access-subterra)
- [Questions, bugs and support](#questions-bugs-and-support)
- [License](#license)

---

## Features
Subterra is:
- A Content Management System
- Fast
- Lightweight
- Open-source
- Extendable
- Dynamic
- Built in Node.js and MySQL
- Made with ~love~ the [OST of Hotline Miami](http://store.steampowered.com/app/219152/Hotline_Miami_Soundtrack/) on headphones

## Installation
Subterra is easily installed by typing the following command:

```shell
$ npm install subterra --save
```

---

## Setup
Before you can start expanding your project, you need to set some things up first. After all, Subterra is just a package you add to your project, instead of a package that takes it over fully.

### Server environment
In order for subterra to work on your server, you need to add some env-variables. Create an `.env` file containg these variables:

**Note: Everything after the equals sign, including the parentheses, should be replaced with your specific data.**

```
DB_HOST=( Host-address )
DB_USERNAME=( Database username )
DB_PASSWORD=( Database password )
DB_DATABASE=( The name of the database your site will use, however you want to name it )
DB_PORT=3306

SUBTERRA_USERNAME=( Admin username to Subterra, to your preference (Can only be edited via a MySQL query via tools like MySQL Workbench) )
SUBTERRA_PASSWORD=( Admin password to Subterra, to your preference (Can only be edited via a MySQL query via tools like MySQL Workbench) )

CRYPTO_KEY=( The key to encrypt the administrator password, must be an integer (larger numbers are better) )

SESSION_SECRET=( A string to keep the administrator session a secret )
```

An example `.env` file can also be found on the <a href="https://github.com/BerendPronk/subterra-project">blank Subterra project repository</a> on GitHub.

### File-structure
Though the CMS itself is entirely dynamic, the file-structure it applies must be consistent with the next diagram. You do need to create certain files and folders for Subterra to function, but you are free to expand on these files as you please.

```
project-folder
├─ media (An empty folder in which Subterra stores all image-uploads made via the CMS)
├─ node_modules (Subterra operates from here; folder is created when Subterra is installed)
│  └─ ...
├─ routes (The necessary routes for your project)
│  ├─ main.js
│  └─ page.js
├─ views (The necessary ejs-views for your project)
│  ├─ error.ejs
│  ├─ index.ejs
│  └─ page.ejs
├─ .env (The previously mentioned .env file)
├─ package.json (The package.json file from your own project)
├─ server.js (The server your project runs on)
```

### Files to add - The blank project folder
All files can be found in a repository on GitHub. You can <a href="https://github.com/BerendPronk/subterra-project">checkout the code</a> or directly clone the needed files in a new folder on your system with the following command:

```shell
$ git clone https://github.com/BerendPronk/subterra-project.git
```

---

## Access Subterra
Navigate to `/subterra` and log in with the administrator data you added in the [server environment file](#server-environment).

---

## Questions, bugs and support
Is there something wrong with Subterra, or are you having trouble setting everything up? File an issue over on the [issues page](https://github.com/BerendPronk/subterra/issues) of Subterra. The users of Subterra and I would love to help.

Bugs and feature ideas should be filed as issues, as well.

---

## License
[MIT](https://github.com/BerendPronk/subterra/blob/master/LICENSE)

Copyright - Berend Pronk

2017
