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
- Exendable
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

### File-structure
Though the CMS itself is entirely dynamic, the file-structure it applies must be consistent with the next diagram. You do need to create certain files and folders for Subterra to function, but you are free to expand on these files as you please.

```
project-folder
| media (An empty folder in which Subterra stores all image-uploads made via the CMS)
| node_modules (Subterra operates from here; folder is created when Subterra is installed)
| | ...
| routes (The necessary routes for your project)
| | main.js
| | page.js
| views (The necessary ejs-views for your project)
| | error.ejs
| | index.ejs
| | page.ejs
| .env (The previously mentioned .env file)
| package.json (The package.json file from your own project)
| server.js (The server your project runs on)
```

### Files to add
Now follow the files to add. You can just copy and paste them, as long as they follow the right paths and filenames as mentioned in the previous section of this README.

#### server.js
```javascript
const dotenv = require('dotenv').config();
const subterra = require('subterra');
const express = require('express');
const app = express();

// Define view paths
let viewArray = [
  __dirname + '/views'
];

// Configure subterra
subterra.config({
  application: app,
  views: viewArray
});

// Define static-file serving
app.use('/', express.static(__dirname + '/'))

// Set view engine to EJS
app.set('view engine', 'ejs').set('views', viewArray);

// Define app routing
app.use('/', require('./routes/main'));

// Run the application
app.listen(process.env.PORT || 3000, () => {
	console.log('Server started');
});
```

#### routes/main.js
```javascript
const express = require('express');
const router = express.Router();

// Define page routing
router.use('/page', require('./page'));

// [GET] /:index
router.get('/', (req, res) => {
  req.getConnection((err, connection) => {
    // Select the subterra database
    connection.query(`
      USE ${ process.env.DB_DATABASE }
    `, [], (err, log) => {

      // Retrieve all pages
      connection.query(`
        SELECT * FROM pages
      `, [], (err, pages) => {

        // Render index page
        res.render('index', {
          pages: pages
        });
      });
    });
  });
});

// [GET] /:not-found
router.get('/*', (req, res) => {
  res.render('error');
});

module.exports = router;
```

#### routes/page.js
```javascript
const express = require('express');
const router = express.Router();

// [GET] /page/:id
router.get('/:id', (req, res) => {
  req.getConnection((err, connection) => {
    // Select the subterra database
    connection.query(`
      USE ${ process.env.DB_DATABASE }
    `, [], (err, log) => {

      // Retrieve all page data
      connection.query(`
        SELECT * FROM pages
        WHERE id = ${ req.params.id }
      `, [], (err, pages) => {
        const page = pages[0];

        // Check if page exists
        if (page) {
          // Page menu specific variables
          const pageMenus = page.menus.split(',');
          let menuChildren = [];

          // Will store ordered HTML content
          let contentBlocks = [];

          // Process page content to HTML
          page.content.split('|-|').forEach(block => {
            switch (block.charAt(1)) {
              case 'H':
                contentBlocks.push(`
                  <h3>${ block.replace('|H|', '') }</h3>
                `);
              break;
              case 'P':
                contentBlocks.push(`
                  <p>${ block.replace('|P|', '').replace(/\n/g, '<br>') }</p>
                `);
              break;
              case 'I':
                contentBlocks.push(`
                  <img src="/media/${ block.replace('|I|', '') }" alt="Image about ${ page.title }" onclick="modal.open()">
                `);
              break;
              case 'L':
                const listContent = block.replace('|L|', '').split('|');
                const listName = listContent[0];
                const list = listContent[1].split(',').filter(e => {
                  // Removes empty data fields
                  return e;
                });
                let listString = '';

                // Give HTML to each item in list
                list.forEach(item => {
                  listString += `
                    <li>
                      ${ item }
                    </li>
                  `;
                });

                contentBlocks.push(`
                  <h3>${ listName }</h3>
                  <ul>
                    ${ listString }
                  </ul>
                `);
              break;
              case 'E':
                const host = block.replace('|E|', '');

                // Check source of embedded video
                if (host.indexOf('youtube.com') !== -1) {
                  contentBlocks.push(`
                    <iframe width="640" height="360" src="https://www.youtube.com/embed/${ host.split('.com/watch?v=')[1] }" frameborder="0" allowfullscreen></iframe>
                  `);
                } else if (host.indexOf('vimeo.com') !== -1) {
                  contentBlocks.push(`
                    <iframe width="640" height="360" src="https://player.vimeo.com/video/${ host.split('.com/')[1].replace('/', '') }" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>
                  `);
                } else {
                  contentBlocks.push(`
                    <a href="${ host }" class="button">Bekijk video</a>
                  `)
                }
              break;
              case 'B':
                const buttonContent = block.replace('|B|', '').split('|');
                const buttonName = buttonContent[0];
                const buttonAnchor = buttonContent[1].split('-')[0];

                contentBlocks.push(`
                  <a href="/page/${ buttonAnchor }" class="button">${ buttonName }</a>
                `);
              break;
            }
          });

          // Fetch all menus from database
          connection.query(`
            SELECT * FROM menus
          `, [], (err, menus) => {

            // Fetch all pages from database
            connection.query(`
              SELECT * FROM pages
            `, [], (err, pages) => {

              // Pushes array of each page menu's children
              pageMenus.forEach(pageMenu => {
                menus.forEach(menu => {
                  if (menu.name === pageMenu) {
                    const children = menu.children.split(',');
                    let pageData = [];

                    // Retrieve type from children
                    children.forEach(child => {
                      pages.forEach(page => {
                        if (page.title === child) {
                          // Push both type and title in array
                          pageData.push({
                            id: page.id,
                            type: page.type,
                            title: child
                          });
                        }
                      });
                    });

                    // Add page data array to menu chidlren array
                    menuChildren.push(pageData);
                  }
                });
              });

              // Render page view
              res.render('page', {
                admin: req.session.username,
                tv: req.session.tv,
                pathname: '/page',
                page: {
                  id: page.id,
                  category: page.category,
                  type: page.type.replace(/ /g, '-'),
                  title: page.title,
                  menus: pageMenus.filter(e => {
                    // Removes empty data fields
                    return e;
                  }),
                  menuChildren: menuChildren,
                  content: contentBlocks
                }
              });
            });
          });
        } else {
          // Render error page
          res.render('error');
        }
      });
    });
  });
});

module.exports = router;
```

#### views/index.ejs
```ejs
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width">
    <title>Subterra-added pages</title>
</head>
<body>

  <h1>Subterra-added pages</h1>

  <nav>
    <ul>
      <% for (let i = 0; i < pages.length; i++) { %>
        <li>
          <a href="/page/<%= pages[i].id %>">
              <%= pages[i].title %>
          </a>
        </li>
      <% } %>
    </ul>
  </nav>

</body>
</html>
```

#### views/page.js
```ejs
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width">
    <title>Subterra-edited page</title>
</head>
<body>

  <h1><%= page.title %></h1>

  <main>
    <article>
      <% if (page.content.length > 0) { %>
        <% for (let i = 0; i < page.content.length; i++) { %>
          <%- page.content[i] %>
        <% } %>
      <% } %>
    </article>

    <% if (page.menus.length > 0) { %>
      <% for (let i = 0; i < page.menus.length; i++) { %>
        <section data-type="menu">
          <nav data-nav="children">
            <h3><%= page.menus[i] %></h3>
            <ul>
              <% for (let j = 0; j < page.menuChildren[i].length; j++) { %>
                <li data-page-type="<%= page.menuChildren[i][j].type %>">
                  <a href="/page/<%= page.menuChildren[i][j].id %>">
                    <%= page.menuChildren[i][j].title %>
                  </a>
                </li>
              <% } %>
            </ul>
          </nav>
        </section>
      <% } %>
    <% } %>
  </main>

</body>
</html>
```

#### views/error.ejs
```ejs
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width">
    <title>No page found</title>
</head>
<body>

  <h1>404.</h1>
  <p>
    Page not found.<br>
    <a href="/">Go back home</a>
  </p>

</body>
</html>
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
