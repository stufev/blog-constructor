document.addEventListener("DOMContentLoaded", () => {
    const categories = [
        {id: 0, code: 0, name: "Коллекции"},
        {id: 1, code: 1, name: "Новости"},
        {id: 2, code: 2, name: "Интервью"},
    ];

    const categorySelect = document.getElementById("categorySelect");
    const dateText = document.getElementById("dateText");
    const datePicker = document.getElementById("datePicker");
    const blocksContainer = document.getElementById("blocksContainer");

    datePicker.addEventListener("change", () => {
        if (datePicker.value) {
            const d = new Date(datePicker.value);
            const day = String(d.getDate()).padStart(2, "0");
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const year = d.getFullYear();
            dateText.value = `${day}.${month}.${year}`;
        }
    });

    const createBlock = () => {
        const block = document.createElement("div");
        block.classList.add("block");

        const typeSelect = document.createElement("select");
        typeSelect.innerHTML = `
      <option value="">-- выберите тип --</option>
      <option value="text">text</option>
      <option value="image">image</option>
      <option value="image-slider">image-slider</option>
      <option value="products-slider">products-slider</option>
    `;
        block.appendChild(typeSelect);

        const contentDiv = document.createElement("div");
        block.appendChild(contentDiv);

        typeSelect.addEventListener("change", () => {
            contentDiv.innerHTML = '';
            const type = typeSelect.value;
            if (!type) return;
            if (type === 'text') {
                const textarea = document.createElement('textarea');
                textarea.placeholder = 'Введите HTML или текст';
                contentDiv.appendChild(textarea);
            } else if (type === 'image') {
                const urlInput = document.createElement('input');
                urlInput.type = 'url';
                urlInput.placeholder = 'URL изображения';
                const textInput = document.createElement('input');
                textInput.type = 'text';
                textInput.placeholder = 'Описание изображения';
                const altInput = document.createElement('input');
                altInput.type = 'text';
                altInput.placeholder = 'ALT изображения';
                contentDiv.appendChild(urlInput);
                contentDiv.appendChild(textInput);
                contentDiv.appendChild(altInput);
            } else if (type === 'image-slider') {
                const imagesContainer = document.createElement('div');
                const addImgBtn = document.createElement('button');
                addImgBtn.textContent = 'Добавить изображение';
                addImgBtn.type = 'button';
                addImgBtn.classList.add('small');

                addImgBtn.addEventListener('click', () => {
                    const wrapper = document.createElement('div');
                    wrapper.style.display = 'flex';
                    wrapper.style.gap = '6px';
                    wrapper.style.marginBottom = '6px';

                    const imgInput = document.createElement('input');
                    imgInput.type = 'url';
                    imgInput.placeholder = 'URL изображения';

                    const altInput = document.createElement('input');
                    altInput.type = 'text';
                    altInput.placeholder = 'ALT изображения';

                    wrapper.appendChild(imgInput);
                    wrapper.appendChild(altInput);
                    imagesContainer.appendChild(wrapper);
                });

                contentDiv.appendChild(imagesContainer);
                contentDiv.appendChild(addImgBtn);
            } else if (type === 'products-slider') {
                const productsContainer = document.createElement('div');
                const addProductBtn = document.createElement('button');
                addProductBtn.textContent = 'Добавить продукт (ID)';
                addProductBtn.type = 'button';
                addProductBtn.classList.add('small');

                addProductBtn.addEventListener('click', () => {
                    const prodInput = document.createElement('input');
                    prodInput.type = 'number';
                    prodInput.placeholder = 'ID продукта';
                    productsContainer.appendChild(prodInput);
                });

                contentDiv.appendChild(productsContainer);
                contentDiv.appendChild(addProductBtn);
            }
        });

        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Удалить блок';
        removeBtn.type = 'button';
        removeBtn.classList.add('removeBlock');
        removeBtn.addEventListener('click', () => block.remove());
        block.appendChild(removeBtn);

        blocksContainer.appendChild(block);
    };

    document.getElementById('addBlock').addEventListener('click', createBlock);

    document.getElementById('generate').addEventListener('click', () => {
        const form = document.getElementById('form');

        // кастомная проверка всех required
        const requiredFields = form.querySelectorAll("[required]");
        for (let field of requiredFields) {
            if (!field.value.trim()) {
                alert("Пожалуйста, заполните поле: " + (field.placeholder || field.previousSibling?.textContent || field.id));
                field.focus();
                return;
            }
        }

        const cat = categories[categorySelect.value];
        const contentBlocks = [];

        document.querySelectorAll('#blocksContainer .block').forEach(block => {
            const type = block.querySelector('select').value;
            if (!type) return;
            let obj = {type};

            if (type === 'text') {
                obj.content = block.querySelector('textarea').value;
            } else if (type === 'image') {
                const inputs = block.querySelectorAll('input');
                obj.image = {
                    url: inputs[0].value,
                    text: inputs[1].value,
                    alt: inputs[2].value,
                };
            } else if (type === 'image-slider') {
                obj.images = Array.from(block.querySelectorAll('div > div')).map(wrapper => {
                    const inputs = wrapper.querySelectorAll('input');
                    return {
                        url: inputs[0].value,
                        alt: inputs[1].value
                    };
                });
            } else if (type === 'products-slider') {
                obj.products = Array.from(block.querySelectorAll('div input')).map(i => Number(i.value));
            }
            contentBlocks.push(obj);
        });

        const result = {
            category: cat,
            name: document.getElementById('name').value,
            author: document.getElementById('author').value || null,
            tag: document.getElementById('tag').value,
            date: dateText.value,
            attachments: {
                bigImg: document.getElementById('bigImg').value,
                mediumImg: document.getElementById('mediumImg').value,
                smallImg: document.getElementById('smallImg').value,
                latestImg: document.getElementById('latestImg').value,
                mainImg: document.getElementById('mainImg').value,
                headerImg: document.getElementById('headerImg').value,
            },
            content: contentBlocks
        };

        document.getElementById('output').value = JSON.stringify(result, null, 2);
    });

    document.getElementById('copy').addEventListener('click', () => {
        const out = document.getElementById('output');
        out.select();
        document.execCommand('copy');
        const msg = document.getElementById('copyMsg');
        msg.style.display = 'inline';
        setTimeout(() => msg.style.display = 'none', 1500);
    });
});
