// Subterra content module related functions
const module = (() => {

  // Add an empty module to the page content fields
  const add = () => {
    const pageContent = document.querySelector('ul[data-list="content"]');
    const index = pageContent.children.length;
    let newModule;

    switch (event.target.value) {
      case 'heading':
        newModule = `
          <label>
            Heading
            <input name="content-h-${ index }" type="text" onblur="input.set.input()">
          </label>
        `;
      break;
      case 'paragraph':
        newModule = `
          <label>
            Paragraph
            <textarea name="content-p-${ index }" onblur="input.set.input()"></textarea>
          </label>
        `;
      break;
      case 'image':
        newModule = `
          <label>
            Image
            <input name="content-i-${ index }" type="file" accept="image/*" onblur="input.set.image.name()">
          </label>
          <input name="content-i-name-${ index }" type="hidden">
        `;
      break;
      case 'list':
        newModule = `
          <label>
            List Name
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
        `;
      break;
      case 'embed':
        newModule = `
          <label>
            Embedded video<br>
            (YouTube or Vimeo)
            <input name="content-e-${ index }" type="url" onblur="input.set.input()">
          </label>
        `;
      break;
      case 'button':
        const systemPages = document.querySelector('p[data-type="system-pages"]').textContent.split(',');
        let systemPagesString = null;

        // 'page' notation 'id-title'
        systemPages.forEach(page => {
          const pageTitle = page.split('-')[1];

          systemPagesString = `
            ${ systemPagesString }
            <option value="${ page }">
              ${ pageTitle }
            </option>
          `;
        });

        newModule = `
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
        `;
      break;
    }

    // Insert module at the end of the content list
    pageContent.insertAdjacentHTML(
      'beforeend',
      `<li data-order="${ index }">
        ${ newModule }
        <ul data-list="module-features">
          <li>
            <button data-action="move-up" title="Move module up" onclick="module.order('up')">
              <span>Move up</span>
            </button>
          </li>
          <li>
            <button data-action="move-down" title="Move module down" onclick="module.order('down')">
              <span>Move down</span>
            </button>
          </li>
          <li>
            <button data-action="delete" title="Delete module" onclick="module.delete()">
              <span>Delete</span>
            </button>
          </li>
        </ul>
      </li>`
    );

    // Check and update feature buttons to be disabled
    updateButtons(pageContent);

    // Reset module selector
    event.target.classList.add('hidden');
    event.target.selectedIndex = 0;
  };

  // Delete a module from the page
  const remove = () => {
    const field = event.target.parentNode.parentNode.parentNode;
    const pageContent = document.querySelector('ul[data-list="content"]');
    let pageContentFields;

    pageContent.removeChild(field);

    // Reset order attribute of modules
    pageContentFields = pageContent.querySelectorAll(':scope > li');
    pageContentFields.forEach((field, index) => {
      field.setAttribute('data-order', index);
    });

    // Check and update buttons to be disabled
    updateButtons(pageContent);
  };

  // Set module order based on given direction
  const order = direction => {
    const pageContent = document.querySelector('ul[data-list="content"]');
    const fields = pageContent.querySelectorAll('li[data-order]');
    const targetField = event.target.parentNode.parentNode.parentNode;
    const curPos = Number(targetField.getAttribute('data-order'));
    let newPos;
    let newOrder = [];

    // Add content fields to editable array
    fields.forEach(field => {
      newOrder.push(field);
    });

    switch (direction) {
      case 'up':
        // Early exit when module is already in top position
        if (curPos === 0) {
          break;
        }

        // Define new order to be set
        newPos = curPos - 1;

        // Reassign content field orders
        newOrder.forEach(field => {
          const order = Number(field.getAttribute('data-order'));

          if (order === newPos) {
            field.setAttribute('data-order', order + 1);
          } else if (order === curPos) {
            // Set desired module in place
            field.setAttribute('data-order', newPos);
          }
        });
      break;
      case 'down':
        // Early exit when module is already in bottom position
        if (curPos === (fields.length - 1)) {
          break;
        }

        // Define new order to be set
        newPos = curPos + 1;

        // Reassign content field orders
        newOrder.forEach(field => {
          const order = Number(field.getAttribute('data-order'));

          if (order === newPos) {
            field.setAttribute('data-order', order - 1);
          } else if (order === curPos) {
            // Set desired module in place
            field.setAttribute('data-order', newPos);
          }
        });
      break;
    }

    // Remove all content fields from form
    while (pageContent.children[0]) {
      pageContent.removeChild(pageContent.children[0]);
    }

    // Sort new order array
    newOrder.sort((a, b) => {
      return Number(a.getAttribute('data-order')) - Number(b.getAttribute('data-order'));
    });

    // Add ordered fields to form
    newOrder.forEach(field => {
      pageContent.insertAdjacentHTML(
        'beforeend',
        field.outerHTML
      );
    });

    // Check and update buttons to be disabled
    updateButtons(pageContent);
  };

  // Check and update buttons to be disabled
  const updateButtons = list => {
    const modules = list.querySelectorAll('li[data-order]');

    // Check every single module
    modules.forEach((module, index) => {
      const moveUp = module.querySelector('button[data-action="move-up"]');
      const moveDown = module.querySelector('button[data-action="move-down"]');

      index === 0 ? moveUp.disabled = true : moveUp.disabled = false;
      index === modules.length - 1 ? moveDown.disabled = true : moveDown.disabled = false;
    });
  };

  // Export functions
  return {
    add: add,
    delete: remove,
    order: order
  };
})();
