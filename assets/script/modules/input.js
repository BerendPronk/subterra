// Subterra input related functions
const input = (() => {

  const add = {
    list: {
      // Add list item input to hidden list input field
      item: () => {
        const field = event.target.parentNode.parentNode.parentNode;
        const listInput = field.querySelector('input[name^="content-l-list"]');
        const nameValue = field.querySelector('input[name^="content-l-name"]').value;
        const list = field.querySelector('ul');
        const listItems = list.querySelectorAll('li');
        let listItemValues = [];

        listItems.forEach(item => {
          const value = item.querySelector('input').value;

          listItemValues.push(value);
        });

        listInput.value = `${ nameValue }|${ listItemValues.join(',') }`;
      },
      // Add an empty input field to list
      input: () => {
        const list = event.target.parentNode.querySelector('ul');
        const listIndex = list.children.length;

        list.insertAdjacentHTML(
          'beforeend',
          `<li>
            <input type="text" oninput="input.add.list.item()" onblur="input.set.input()">
          </li>`
        );

        event.preventDefault();
      }
    }
  };

  const set = {
    // Set value to input/textarea based on target
    input: () => {
      switch (event.target.nodeName.toLowerCase()) {
        case 'input':
          event.target.setAttribute('value', event.target.value);
          // Unfortunately this doens't work for images, since browsers are unable to receive image path
          // Source: https://stackoverflow.com/questions/4851595/how-to-resolve-the-c-fakepath
        break;
        case 'textarea':
          event.target.textContent = event.target.value;
        break;
        case 'select':
          event.target.setAttribute('value', event.target.value);

          event.target.querySelectorAll('option').forEach(option => {
            if (option.value === event.target.value) {
              option.setAttribute('selected', true);
            }
          })
        break;
      }
    },
    list: {
      // Add list name input to hidden input field
      name: () => {
        const field = event.target.parentNode.parentNode;
        const listInput = field.querySelector('input[name^="content-l-list"]');
        const nameValue = event.target.value;
        const list = field.querySelector('ul');
        const listItems = list.querySelectorAll('li');
        let listItemValues = [];

        listItems.forEach(item => {
          const value = item.querySelector('input').value;

          listItemValues.push(value);
        });

        listInput.value = `${ nameValue }|${ listItemValues.join(',') }`;
      }
    },
    image: {
      // Add image name to hidden input field
      name: () => {
        const field = event.target.parentNode.parentNode;
        const nameInput = field.querySelector('input[name^="content-i-name"]');

        nameInput.value = event.target.value.replace('C:\\fakepath\\', '');
      }
    },
    button: {
      // Add button name to hidden input field
      name: () => {
        const field = event.target.parentNode.parentNode;
        const buttonName = event.target.value;
        const buttonAnchor = field.querySelector('select[name^="content-b-anchor"]').value;
        const buttonInput = field.querySelector('input[name^="content-b-link"]');

        if (buttonAnchor) {
          buttonInput.value = `${ buttonName }|${ buttonAnchor }`;
        } else {
          buttonInput.value = `${ buttonName }|`;
        }
      },
      // Add button anchor to hidden input field
      anchor: () => {
        const field = event.target.parentNode.parentNode;
        const buttonName = field.querySelector('input[name^="content-b-name"]').value;
        const buttonAnchor = event.target.value;
        const buttonInput = field.querySelector('input[name^="content-b-link"]');

        buttonInput.value = `${ buttonName }|${ buttonAnchor }`;
      }
    }
  };

  const clear = {
    // Remove input from specific input type
    input: () => {
      event.preventDefault();
      const field = event.target.parentNode.parentNode.parentNode;

      switch (field.getAttribute('data-content')) {
        case 'paragraph':
          field.querySelector('textarea').textContent = '';
          field.querySelector('textarea').value = '';
        break;
        case 'image':
          field.querySelector('input[name="content-i"]').value = '';
          field.querySelector('input[name="content-i-name"]').value = '';

          if (field.querySelector('img')) {
            field.querySelector('img').remove();
          }
        break;
        case 'embed':
          field.querySelector('input[name="content-e"]').value = '';
        break;
      }
    }
  };

  // Export functions
  return {
    add: add,
    set: set,
    clear: clear
  };
})();
