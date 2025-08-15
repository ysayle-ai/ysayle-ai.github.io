// 自定义搜索脚本 - 仅搜索文章标题
let fuse; // holds our search engine
let resList = document.getElementById('searchResults');
let sInput = document.getElementById('searchInput');
let first, last, current_elem = null
let resultsAvailable = false;

// load our search index
window.onload = function () {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                let data = JSON.parse(xhr.responseText);
                if (data) {
                    console.log('搜索索引数据:', data);
                    
                    // fuse.js options - 只搜索标题
                    let options = {
                        distance: 100,
                        threshold: 0.4,
                        ignoreLocation: true,
                        keys: [
                            'title' // 只搜索标题
                        ]
                    };
                    
                    // 使用配置中的参数（如果有的话）
                    if (window.fuseOpts) {
                        options = {
                            isCaseSensitive: window.fuseOpts.isCaseSensitive ?? false,
                            includeScore: window.fuseOpts.includeScore ?? false,
                            includeMatches: window.fuseOpts.includeMatches ?? false,
                            minMatchCharLength: window.fuseOpts.minMatchCharLength ?? 1,
                            shouldSort: window.fuseOpts.shouldSort ?? true,
                            findAllMatches: window.fuseOpts.findAllMatches ?? false,
                            keys: ['title'], // 强制只搜索标题
                            location: window.fuseOpts.location ?? 0,
                            threshold: window.fuseOpts.threshold ?? 0.4,
                            distance: window.fuseOpts.distance ?? 100,
                            ignoreLocation: window.fuseOpts.ignoreLocation ?? true
                        }
                    }
                    
                    console.log('Fuse.js 配置:', options);
                    fuse = new Fuse(data, options); // build the index from the json file
                }
            } else {
                console.log('搜索索引加载失败:', xhr.responseText);
            }
        }
    };
    xhr.open('GET', "../index.json");
    xhr.send();
}

function activeToggle(ae) {
    document.querySelectorAll('.focus').forEach(function (element) {
        // rm focus class
        element.classList.remove("focus")
    });
    if (ae) {
        ae.focus()
        document.activeElement = current_elem = ae;
        ae.parentElement.classList.add("focus")
    } else {
        document.activeElement.parentElement.classList.add("focus")
    }
}

function reset() {
    resultsAvailable = false;
    resList.innerHTML = sInput.value = ''; // clear inputbox and searchResults
    sInput.focus(); // shift focus to input box
}

// execute search as each character is typed
sInput.onkeyup = function (e) {
    // run a search query (for "term") every time a letter is typed
    // in the search box
    if (fuse) {
        let searchTerm = this.value.trim();
        console.log('搜索关键词:', searchTerm);
        
        let results;
        if (window.fuseOpts && window.fuseOpts.limit) {
            results = fuse.search(searchTerm, {limit: window.fuseOpts.limit}); // the actual query being run using fuse.js along with options
        } else {
            results = fuse.search(searchTerm); // the actual query being run using fuse.js
        }
        
        console.log('搜索结果:', results);
        
        if (results.length !== 0) {
            // build our html if result exists
            let resultSet = ''; // our results bucket
            let seenTitles = new Set(); // 用于去重
            let uniqueResults = []; // 存储去重后的结果

            // 去重逻辑
            for (let item of results) {
                if (!seenTitles.has(item.item.title)) {
                    seenTitles.add(item.item.title);
                    uniqueResults.push(item);
                }
            }

            // 构建HTML，只显示去重后的结果
            for (let item of uniqueResults) {
                resultSet += `<li class="post-entry"><header class="entry-header">${item.item.title}&nbsp;»</header>` +
                    `<a href="${item.item.permalink}" aria-label="${item.item.title}"></a></li>`
            }

            resList.innerHTML = resultSet;
            resultsAvailable = true;
            first = resList.firstChild;
            last = resList.lastChild;
        } else {
            resultsAvailable = false;
            resList.innerHTML = '';
        }
    }
}

sInput.addEventListener('search', function (e) {
    // clicked on x
    if (!this.value) reset()
})

// kb bindings
document.onkeydown = function (e) {
    let key = e.key;
    let ae = document.activeElement;

    let inbox = document.getElementById("searchbox").contains(ae)

    if (ae === sInput) {
        let elements = document.getElementsByClassName('focus');
        while (elements.length > 0) {
            elements[0].classList.remove('focus');
        }
    } else if (current_elem) ae = current_elem;

    if (key === "Escape") {
        reset()
    } else if (!resultsAvailable || !inbox) {
        return
    } else if (key === "ArrowDown") {
        e.preventDefault();
        if (ae == sInput) {
            // if the currently focused element is the search input, focus the <a> of first <li>
            activeToggle(resList.firstChild.lastChild);
        } else if (ae.parentElement != last) {
            // if the currently focused element's parent is last, do nothing
            // otherwise select the next search result
            activeToggle(ae.parentElement.nextSibling.lastChild);
        }
    } else if (key === "ArrowUp") {
        e.preventDefault();
        if (ae.parentElement == first) {
            // if the currently focused element is first item, go to input box
            activeToggle(sInput);
        } else if (ae != sInput) {
            // if the currently focused element is input box, do nothing
            // otherwise select the previous search result
            activeToggle(ae.parentElement.previousSibling.lastChild);
        }
    } else if (key === "ArrowRight") {
        ae.click(); // click on active link
    }
}
