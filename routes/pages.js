const database = require('../assets/script/modules/database');
const express = require('express');
const router = express.Router();

// [GET] /subterra/pages
router.get('/', (req, res) => {
  console.log(`[${ req.method }] /subterra/pages`);

  // Object containing system data, after MySQL queries
  let system = {
    pages: [],
    types: []
  };

  // Check if a session already exists
  if (!req.session.username) {
    // Provide feedback that login session has ended
    res.redirect(`/subterra/login?feedback=Your login session ended. Log in again below.&state=negative`);
    return;
  }

  req.getConnection((err, connection) => {
    // Fetch all pages from database
    connection.query(`
      SELECT * FROM pages
    `, [], (err, pages) => {
      pages.forEach(page => {
        // Push pages in system object
        system.pages.push({
          id: page.id,
          title: page.title,
          type: page.type
        });
      });

      connection.query(`
        SELECT * FROM types
      `, [], (err, types) => {
        // Push page types in system object
        types.forEach(type => {
          system.types.push(type.name);
        });

        res.render('pages/index', {
          username: req.session.username,
          pathname: '/subterra/pages',
          feedback: req.query.feedback,
          feedbackState: req.query.state,
          system: {
            pages: system.pages,
            types: system.types
          }
        });
      });
    });
  });
});

// [GET] /subterra/pages/add
router.get('/add/:type', (req, res) => {
  console.log(`[${ req.method }] /subterra/pages/add`);

  // Check if a session already exists
  if (!req.session.username) {
    // Provide feedback that login session has ended
    res.redirect(`/subterra/login?feedback=Your login session ended. Log in again below.&state=negative`);
    return;
  }

  req.getConnection((err, connection) => {
    // Fetch system data from database
    database.retrieve(connection, {
      category: 'pages',
      tables: ['types', 'categories', 'menus', 'pages', 'modules'],
      callback: systemData => {
        // Fetch default modules from specific page type
        connection.query(`
          SELECT * FROM types
          WHERE name = '${ req.params.type }'
        `, [], (err, type) => {
          const defaultModules = type[0].defaultModules;
          let contentFields = [];

          // Apply default modules to content string
          defaultModules.split(',').forEach((module, index) => {
            switch (module) {
              case 'heading':
                contentFields.push(`
                  <label>
                    Heading
                    <input name="content-h-${ index }" type="text" onblur="input.set.input()">
                  </label>
                `);
              break;
              case 'paragraph':
                contentFields.push(`
                  <label>
                    Paragraph
                    <textarea name="content-p-${ index }" onblur="input.set.input()"></textarea>
                  </label>
                `);
              break;
              case 'image':
                contentFields.push(`
                  <label>
                    Image
                    <input name="content-i-${ index }" type="file" accept="image/*" onblur="input.set.image.name()">
                  </label>
                  <input name="content-i-name-${ index }" type="hidden">
                `);
              break;
              case 'list':
                contentFields.push(`
                  <label>
                    List name
                    <input name="content-l-name-${ index }" type="text" oninput="input.set.list.name()" onblur="input.set.input()">
                  </label>
                  <label>List items</label>
                  <ul>
                    <li>
                      <input type="text" oninput="input.add.list.item()" onblur="input.set.input()">
                    </li>
                  </ul>
                  <button data-type="addToList" onclick="input.add.list.input()">Add item</button>
                  <input name="content-l-list-${ index }" type="hidden">
                `);
              break;
              case 'embed':
                contentFields.push(`
                  <label>
                    Embedded video<br>
                    (YouTube or Vimeo)
                    <input name="content-e-${ index }" type="url" onblur="input.set.input()">
                  </label>
                `);
              break;
              case 'button':
                let systemPagesString;

                systemData.pages.forEach(page => {
                  const pageTitle = page.split('-')[1];

                  systemPagesString = `
                    ${ systemPagesString }
                    <option value="${ page }">
                      ${ pageTitle }
                    </option>
                  `;
                });

                contentFields.push(`
                  <label>
                    Button name
                    <input name="content-b-name-${ index }" type="text" oninput="input.set.button.name()" onblur="input.set.input()">
                  </label>
                  <label>
                    Button link
                    <select name="content-b-anchor-${ index }" oninput="input.set.button.anchor()" onblur="input.set.input()">
                      <option value="" disabled selected>Select a page</option>
                      ${ systemPagesString }
                    </select>
                  </label>
                  <input name="content-b-link-${ index }" type="hidden">
                `);
              break;
            }
          });

          res.render('pages/add', {
            username: req.session.username,
            pathname: '/subterra/pages',
            feedback: req.query.feedback,
            feedbackState: req.query.state,
            system: systemData,
            page: {
              type: req.params.type,
              content: contentFields
            }
          });
        });
      }
    });
  });
});

// [POST] /subterra/pages/add
router.post('/add', (req, res) => {
  console.log(`[${ req.method }] /subterra/pages/add`);

  // Array that will store all content fields
  let content = [];

  // Extract all separate content fields
  Object.keys(req.body).forEach(field => {
    // Early exit to prevent empty fields being stored in database
    if (req.body[field].replace(/ /g, '') === '') {
      return;
    }

    // Switch on content fields only
    if (field.indexOf('content-') !== -1) {
      switch (field.charAt(8).toUpperCase()) {
        case 'H':
          content.push(`|H|${ req.body[field] }`);
        break;
        case 'P':
          content.push(`|P|${ req.body[field].replace(/\|/g, '—') }`);
        break;
        case 'I':
          // Only pick image name input
          if (field.indexOf('content-i-name') !== -1) {
            content.push(`|I|${ req.body[field] }`);
          }
        break;
        case 'L':
          // Only pick grouped input
          if (field.indexOf('content-l-list') !== -1) {
            content.push(`|L|${ req.body[field].replace(/,,/g, ',') }`);
          }
        break;
        case 'E':
          content.push(`|E|${ req.body[field] }`);
        break;
        case 'B':
          // Only pick grouped input
          if (field.indexOf('content-b-link') !== -1) {
            content.push(`|B|${ req.body[field] }`);
          }
        break;
      }
    }
  });

  const data = {
    type: req.body.type,
    title: req.body.title.replace(/'/g, '"'),
    category: req.body.category,
    menus: req.body.menus,
    content: content.join('|-|').replace(/'/g, '"')
  };

  // Check if a session already exists
  if (!req.session.username) {
    // Provide feedback that login session has ended
    res.redirect(`/subterra/login?feedback=Your login session ended. Log in again below.&state=negative`);
    return;
  }

  req.getConnection((err, connection) => {
    // Fetch all pages from database
    connection.query(`
      SELECT * FROM pages
    `, [], (err, pages) => {
      let exists;

      // Check if page title already exists
      pages.forEach(page => {
        if (page.title.toLowerCase() === data.title.toLowerCase()) {
          exists = true;
        }
      });

      if (!exists) {
        // Add submitted data to database
        connection.query(`
          INSERT INTO pages SET ?
        `, [data], (err, log) => {
          // Navigate to /subterra/pages overview
          res.redirect(`/subterra/pages?feedback='${ data.title }' was successfully added.&state=positive`);
        });
      } else {
        // Provide feedback that page title already exists
        res.redirect(`/subterra/pages/add/${ data.type }?feedback=Page with title '${ data.title.toLowerCase() }' already exists.&state=negative`);
      }
    });
  });
});

// [GET] /subterra/pages/edit/:id
router.get('/edit/:id', (req, res) => {
  console.log(`[${ req.method }] /subterra/pages/edit/${ req.params.id }`);

  // Check if a session already exists
  if (!req.session.username) {
    // Provide feedback that login session has ended
    res.redirect(`/subterra/login?feedback=Your login session ended. Log in again below.&state=negative`);
    return;
  }

  req.getConnection((err, connection) => {
    // Select page with ID from GET parameter
    connection.query(`
      SELECT * FROM pages
      WHERE id = '${ req.params.id }'
    `, [], (err, pages) => {
      const page = pages[0];
      let contentFields = [];

      // Fetch all system page types from database
      database.retrieve(connection, {
        category: 'pages',
        tables: ['types', 'categories', 'menus', 'pages', 'modules'],
        callback: systemData => {
          // Process output to content fields
          page.content.split('|-|').forEach((field, index) => {
            switch (field.charAt(1)) {
              case 'H':
                contentFields.push(`
                  <label>
                    Heading
                    <input name="content-h-${ index }" type="text" onblur="input.set.input()" value="${ field.replace('|H|', '') }">
                  </label>
                `);
              break;
              case 'P':
                contentFields.push(`
                  <label>
                    Paragraph
                    <textarea name="content-p-${ index }" onblur="input.set.input()">${ field.replace('|P|', '') }</textarea>
                  </label>
                `);
              break;
              case 'I':
                contentFields.push(`
                  <label>
                    Image
                    <input name="content-i-${ index }" type="file" accept="image/*" onblur="input.set.image.name()">
                  </label>
                  <img src="/media/${ field.replace('|I|', '') }" alt="Image about ${ page.title }">
                  <input name="content-i-name-${ index }" type="hidden" value="${ field.replace('|I|', '') }">
                `);
              break;
              case 'L':
                // Divide content string into separate fields
                const listContent = field.replace('|L|', '').split('|');
                const fieldListName = listContent[0];
                const fieldList = listContent[1].split(',').filter(e => {
                  // Removes empty data fields
                  return e;
                });
                let fieldListString = '';

                // Give HTML to each item in list
                fieldList.forEach(item => {
                  fieldListString += `
                    <li>
                      <input type="text" oninput="input.add.list.item()" onblur="input.set.input()" value="${ item }">
                    </li>
                  `;
                });

                contentFields.push(`
                  <label>
                    List name
                    <input name="content-l-name-${ index }" type="text" oninput="input.set.list.name()" onblur="input.set.input()" value="${ fieldListName }">
                  </label>
                  <label>List items</label>
                  <ul>
                    ${ fieldListString }
                  </ul>
                  <button data-type="addToList" onclick="input.add.list.input()">Add item</button>
                  <input name="content-l-list-${ index }" type="hidden" onblur="input.set.input()" value="${ listContent.join('|') }">
                `);
              break;
              case 'E':
                contentFields.push(`
                  <label>
                    Embedded video<br>
                    (YouTube or Vimeo)
                    <input name="content-e-${ index }" type="url" onblur="input.set.input()" value="${ field.replace('|E|', '') }">
                  </label>
                `);
              break;
              case 'B':
                const buttonContent = field.replace('|B|', '').split('|');
                const fieldButtonName = buttonContent[0];
                const fieldButtonAnchor = buttonContent[1].split('-')[1];
                let systemPagesString;

                systemData.pages.forEach(page => {
                  const pageTitle = page.split('-')[1];

                  systemPagesString = `
                    ${ systemPagesString }
                    <option value="${ page }" ${ fieldButtonAnchor === pageTitle ? 'selected' : '' }>
                      ${ pageTitle }
                    </option>
                  `;
                });

                contentFields.push(`
                  <label>
                    Button name
                    <input name="content-b-name-${ index }" type="text" oninput="input.set.button.name()" onblur="input.set.input()" value="${ fieldButtonName }">
                  </label>
                  <label>
                    Button link
                    <select name="content-b-anchor-${ index }" oninput="input.set.button.anchor()" onblur="input.set.input()">
                      <option value="" disabled selected>Select a page</option>
                      ${ systemPagesString }
                    </select>
                  </label>
                  <input name="content-b-link-${ index }" type="hidden" value="${ field.replace('|B|', '') }">
                `);
              break;
            }
          });

          res.render('pages/edit', {
            username: req.session.username,
            pathname: '/subterra/pages',
            feedback: req.query.feedback,
            feedbackState: req.query.state,
            system: systemData,
            page: {
              id: page.id,
              type: page.type,
              category: page.category,
              title: page.title,
              menus: page.menus.split(',').filter(e => {
                // Removes empty data fields
                return e;
              }),
              content: contentFields
            }
          });
        }
      });
    });
  });
});

// [POST] /subterra/pages/edit/:id
router.post('/edit/:id', (req, res) => {
  console.log(`[${ req.method }] /subterra/pages/edit/${ req.params.id }`);

  // Array that will store all content fields
  let content = [];

  // Extract all separate content fields
  Object.keys(req.body).forEach(field => {
    // Early exit to prevent empty fields being stored in database
    if (req.body[field].replace(/ /g, '') === '') {
      return;
    }

    // Switch on content fields only
    if (field.indexOf('content-') !== -1) {
      switch (field.charAt(8).toUpperCase()) {
        case 'H':
          content.push(`|H|${ req.body[field] }`);
        break;
        case 'P':
          content.push(`|P|${ req.body[field].replace(/\|/g, '—') }`);
        break;
        case 'I':
          // Only pick image name input
          if (field.indexOf('content-i-name') !== -1) {
            content.push(`|I|${ req.body[field] }`);
          }
        break;
        case 'L':
          // Only pick grouped input
          if (field.indexOf('content-l-list') !== -1) {
            content.push(`|L|${ req.body[field].replace(/,,/g, ',') }`);
          }
        break;
        case 'E':
          content.push(`|E|${ req.body[field] }`);
        break;
        case 'B':
          // Only pick grouped input
          if (field.indexOf('content-b-link') !== -1) {
            content.push(`|B|${ req.body[field] }`);
          }
        break;
      }
    }
  });

  const data = {
    type: req.body.type,
    title: req.body.title.replace(/'/g, '"'),
    category: req.body.category,
    menus: req.body.menus,
    content: content.join('|-|').replace(/'/g, '"')
  };

  // Check if a session already exists
  if (!req.session.username) {
    // Provide feedback that login session has ended
    res.redirect(`/subterra/login?feedback=Your login session ended. Log in again below.&state=negative`);
    return;
  }

  req.getConnection((err, connection) => {
    // Fetch all pages from database
    connection.query(`
      SELECT * FROM pages
    `, [], (err, pages) => {
      let exists;
      let currentTitle;

      // Find current menu name
      pages.forEach(page => {
        if (page.id == req.params.id) {
          currentTitle = page.title;
        }
      });

      // Check if page title already exists
      pages.forEach(page => {
        if (page.id != req.params.id && page.title.toLowerCase() === data.title.toLowerCase()) {
          exists = true;
        }
      });

      if (!exists) {
        // Rename page included in menus table
        connection.query(`
          UPDATE menus
          SET children = REPLACE(children, '${ currentTitle }', '${ data.title }')
        `, [], (err, menusLog) => {

          // Rename page included in button modules
          connection.query(`
            UPDATE pages
            SET content = REPLACE(content, '${ currentTitle }', '${ data.title }')
          `, [], (err, pagesLog) => {

            // Update data from page
            connection.query(`
              UPDATE pages SET ?
              WHERE id = ${ req.params.id }
            `, [data], (err, log) => {
              // Navigate to /subterra/pages overview and provide feedback that page was successfully edited
              res.redirect(`/subterra/pages?feedback='${ data.title }' was successfully edited.&state=positive`);
            });
          });
        });
      } else {
        // Provide feedback that page title already exists
        res.redirect(`/subterra/pages/edit/${ req.params.id }?feedback=Page with title '${ data.title.toLowerCase() }' already exists.&state=negative`);
      }
    });
  });
});

// [GET] /subterra/pages/delete/:id
router.get('/delete/:id', (req, res) => {
  console.log(`[${ req.method }] /subterra/pages/delete/${ req.params.id }`);

  req.getConnection((err, connection) => {
    // Retrieve page title
    connection.query(`
      SELECT * FROM pages
      WHERE id = ${ req.params.id }
    `, [], (err, pages) => {
      const page = pages[0].title;

      // Remove page included in menus table (',page' - 'page,' - 'page')
      connection.query(`
        UPDATE menus
        SET children = REPLACE(REPLACE(REPLACE(children, ',${ page }', ''), '${ page },', ''), '${ page }', '')
      `, [], (err, menusLog) => {

        // Remove page from database
        connection.query(`
          DELETE FROM pages
          WHERE id = ${ req.params.id }
        `, [], (err, pagesLog) => {
          // Redirect to page overview page
          res.redirect('/subterra/pages?feedback=Successfully deleted the page.&state=positive');
        });
      });
    });
  });
});

module.exports = router;
