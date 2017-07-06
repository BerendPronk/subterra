// Create a new database
// connection: MySQL connection
// opts:
// {
//   storage: Object,
//   category: String,
//   tables: Array,
//   callback: Function
// }
const create = (connection, opts) => {
  connection.connect(err => {
    // Create database if it doesn't exist
    connection.query(`
      CREATE DATABASE IF NOT EXISTS \`${ opts.subterraDB }\` /*!40100 DEFAULT CHARACTER SET utf8 */;
    `, (err, databaseLog) => {
      // console.log(`[Database] Database '${ opts.subterraDB }' has succesfully been created`);

      // Select newly created database
      connection.query(`
        USE \`${ opts.subterraDB }\`;
      `, (err, useLog) => {
        // console.log(`[Database] Succesfully selected the '${ opts.subterraDB }' database`);

        // Create 'menus' table if it doesn't exist
        connection.query(`
          CREATE TABLE IF NOT EXISTS \`menus\` (
            \`id\` int(11) NOT NULL AUTO_INCREMENT,
            \`name\` varchar(45) DEFAULT NULL,
            \`children\` text,
            PRIMARY KEY (\`id\`)
          ) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8;
        `, (err, menusLog) => {
          // console.log(`[Database] Succesfully created the 'menus' table for the '${ opts.subterraDB }' database`);

          // Create 'modules' table if it doesn't exist
          connection.query(`
            CREATE TABLE IF NOT EXISTS \`modules\` (
              \`id\` int(11) NOT NULL,
              \`name\` varchar(45) DEFAULT NULL,
              PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;
          `, (err, modulesLog) => {
            // console.log(`[Database] Succesfully created the 'modules' table for the '${ opts.subterraDB }' database`);

            connection.query(`
              INSERT IGNORE INTO modules (id, name)
              VALUES
                  (1, 'heading'),
                  (2, 'paragraph'),
                  (3, 'image'),
                  (4, 'list'),
                  (5, 'embed'),
                  (6, 'button');
            `, (err, moduleNameLog) => {
              // console.log(`[Database] Succesfully added modules in the 'modules' table`);

              // Create 'pages' table if it doesn't exist
              connection.query(`
                CREATE TABLE IF NOT EXISTS \`pages\` (
                  \`id\` int(11) NOT NULL AUTO_INCREMENT,
                  \`category\` varchar(255) DEFAULT NULL,
                  \`type\` varchar(45) DEFAULT NULL,
                  \`title\` varchar(45) DEFAULT NULL,
                  \`menus\` varchar(255) DEFAULT NULL,
                  \`content\` text,
                  PRIMARY KEY (\`id\`)
                ) ENGINE=InnoDB AUTO_INCREMENT=189 DEFAULT CHARSET=utf8;
              `, (err, pagesLog) => {
                // console.log(`[Database] Succesfully created the 'pages' table for the '${ opts.subterraDB }' database`);

                // Create 'types' table if it doesn't exist
                connection.query(`
                  CREATE TABLE IF NOT EXISTS \`types\` (
                    \`id\` int(11) NOT NULL AUTO_INCREMENT,
                    \`name\` varchar(45) DEFAULT NULL,
                    \`defaultModules\` text,
                    \`isCategory\` varchar(45) DEFAULT NULL,
                    PRIMARY KEY (\`id\`)
                  ) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8;
                `, (err, typesLog) => {
                  // console.log(`[Database] Succesfully created the 'types' table for the '${ opts.subterraDB }' database`);

                  // Create 'users' table if it doesn't exist
                  connection.query(`
                    CREATE TABLE IF NOT EXISTS \`users\` (
                      \`id\` int(11) NOT NULL,
                      \`username\` varchar(45) DEFAULT NULL,
                      \`password\` varchar(45) DEFAULT NULL,
                      PRIMARY KEY (\`id\`)
                    ) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
                  `, (err, usersLog) => {
                    // console.log(`[Database] Succesfully created the 'users' table for the '${ opts.subterraDB }' database`);

                    // Create an admin account for subterra
                    connection.query(`
                      INSERT IGNORE INTO users (id, username, password)
                      VALUES (1, '${ opts.subterraUsername }', '${ opts.subterraPassword }');
                    `, (err, adminLog) => {
                      // console.log(`[Subterra] Succesfully created the admin '${ opts.subterraUsername }'`);
                      console.log(`[Database] '${ opts.subterraDB }' has succesfully been set-up and is ready for use`);

                      // Return created database
                      return opts.subterraDB;
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
};

// Retrieve data from database
// connection: express-connection
// opts:
// {
//   storage: Object,
//   category: String,
//   tables: Array,
//   callback: Function
// }
const retrieve = (connection, opts) => {
  // Check if callback function has been added
  if (opts && opts.callback) {
    // Define system storage
    let system = {
      types: [],
      categories: [],
      categoryPages: [],
      menus: [],
      pages: [],
      modules: [],
    };

    // Define category based on given options, or set default to undefined
    const category = opts.category || undefined;

    // Define tables to query based on given options, or set default to all
    const tables = opts.tables || ['types', 'categories', 'menus', 'pages', 'modules'];

    // Apply queries to set database content in system variable
    // -
    // Fetch all system page types from database
    connection.query(`
      SELECT * FROM types
    `, [], (err, types) => {
      // Push types in system object
      if (tables.includes('types')) {
        switch (category) {
          case 'types':
            types.forEach(type => {
              system.types.push({
                name: type.name,
                modules: type.defaultModules
              });
            });
          break;
          default:
            types.forEach(type => {
              system.types.push(type.name);
            });
        }
      }

      // Push categories in system object
      if (tables.includes('categories')) {
        types.forEach(type => {
          if (type.isCategory) {
            system.categories.push(type.name);
          }
        });
      }

      // Fetch all system page menus from database
      connection.query(`
        SELECT * FROM menus
      `, [], (err, menus) => {
        // Push menus in system object
        if (tables.includes('menus')) {
          menus.forEach(menu => {
            system.menus.push(menu.name);
          });
        }

        // Fetch all system pages from database
        connection.query(`
          SELECT * FROM pages
        `, [], (err, pages) => {
          if (tables.includes('pages')) {
            switch (category) {
              case 'pages':
                // Push pages in system object
                pages.forEach(page => {
                  system.pages.push(`${ page.id }-${ page.title }`);
                });
              break;
              default:
                // Push pages in system object
                pages.forEach(page => {
                  system.pages.push(page.title);
                });
            }
          }

          // Push categories in system object
          if (tables.includes('categories')) {
            pages.forEach(page => {
              if (system.categories.includes(page.type)) {
                system.categoryPages.push(page.title);
              }
            });
          }

          // Fetch all system modules from database
          connection.query(`
            SELECT * FROM modules
          `, [], (err, modules) => {
            // Push modules in system object
            if (tables.includes('modules')) {
              modules.forEach(module => {
                system.modules.push(module.name);
              });
            }

            // Execute callback
            opts.callback(system);
          });
        });
      });
    });
  } else {
    console.error('[database.retrieve] No callback function given.');
  }
};

// Search in database tables on specific keyword
// connection: express-connection
// opts:
// {
//   query: String,
//   callback: Function
// }
const search = (connection, opts) => {
  if (opts && opts.callback) {
    // Define results storage
    let results = {
      types: [],
      menus: [],
      pages: []
    };

    // Define search query, or set default to search entire database
    const query = opts.query || '';

    // Apply queries to set database content in system variable
    // -
    // Fetch all system types from database that contain query
    connection.query(`
      SELECT * FROM types
      WHERE name LIKE '%${ query }%'
    `, [], (err, types) => {
      // Push types in results object
      types.forEach(type => {
        results.types.push({
          id: type.id,
          name: type.name
        });
      });

      // Fetch all system menus from database that contain query
      connection.query(`
        SELECT * FROM menus
        WHERE name LIKE '%${ query }%'
      `, [], (err, menus) => {
        // Push menus in results object
        menus.forEach(menu => {
          results.menus.push({
            id: menu.id,
            name: menu.name
          });
        });

        // Fetch all system pages from database that contain query
        connection.query(`
          SELECT * FROM pages
          WHERE title LIKE '%${ query }%'
        `, [], (err, pages) => {
          // Push pages in results object
          pages.forEach(page => {
            results.pages.push({
              id: page.id,
              name: page.title
            });
          });

          // Execute callback
          opts.callback(results);
        });
      });
    });
  } else {
    console.error('[database.search] No callback function given.');
  }
};

// Export functions
module.exports = {
  create: create,
  retrieve: retrieve,
  search: search
};
