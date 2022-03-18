let github = document.querySelector('#github');

let getAllData = async (url1, url2) =>{
    let response1 = await fetch(url1);
    let response2 = await fetch(url2);

    if (!response1.ok || !response2.ok) {
        throw new Error(`HTTP error! status: ${response1.status} & ${response2.status}`);
    } else {
        let profile = await response1.json();
        let repos = await response2.json();

        let data = [profile, repos]

        return data;
    }
}

let renderContent = async () => {
    let data = await getAllData('https://api.github.com/users/fredrikac', 'https://api.github.com/users/fredrikac/repos?sort=pushed');
  
    [ profile, repos]  = data;

    //sort by latest updated 
    repos.sort(function (repo1, repo2){
        if(repo1.updated_at > repo2.updated_at){
            return -1;
        }
        return 1;
    });

    //run the cleanHTML-function for safety
    github.innerHTML = cleanHTML(
        `<div class="gh-grid">
            <div class="gh-details">
            <p>
            <a href="${profile.html_url}" target="_blank">${profile.public_repos} publika repon</a>
            </p>
            <ul>
                ${repos.map(function (repo) {
                    return `
                    <li><a href="${repo.html_url}" target="_blank">${repo.name}</a> - senast uppdaterad ${repo.updated_at.slice(0, 10)}</li>`;
                }).join('')}
            </ul>
        </div>
    </div>`
    ); 
};
renderContent();

//Clean up function to prevent XSS-attacks
/*!
 * Sanitize an HTML string
 * (c) 2021 Chris Ferdinandi, MIT License, https://gomakethings.com
 * @param  {String}          str   The HTML string to sanitize
 * @param  {Boolean}         nodes If true, returns HTML nodes instead of a string
 * @return {String|NodeList}       The sanitized string or nodes
 */
function cleanHTML (str, nodes) {

	/**
	 * Convert the string to an HTML document
	 * @return {Node} An HTML document
	 */
	function stringToHTML () {
		let parser = new DOMParser();
		let doc = parser.parseFromString(str, 'text/html');
		return doc.body || document.createElement('body');
	}

	/**
	 * Remove <script> elements
	 * @param  {Node} html The HTML
	 */
	function removeScripts (html) {
		let scripts = html.querySelectorAll('script');
		for (let script of scripts) {
			script.remove();
		}
	}

	/**
	 * Check if the attribute is potentially dangerous
	 * @param  {String}  name  The attribute name
	 * @param  {String}  value The attribute value
	 * @return {Boolean}       If true, the attribute is potentially dangerous
	 */
	function isPossiblyDangerous (name, value) {
		let val = value.replace(/\s+/g, '').toLowerCase();
		if (['src', 'href', 'xlink:href'].includes(name)) {
			if (val.includes('javascript:') || val.includes('data:')) return true;
		}
		if (name.startsWith('on')) return true;
	}

	/**
	 * Remove potentially dangerous attributes from an element
	 * @param  {Node} elem The element
	 */
	function removeAttributes (elem) {

		// Loop through each attribute
		// If it's dangerous, remove it
		let atts = elem.attributes;
		for (let {name, value} of atts) {
			if (!isPossiblyDangerous(name, value)) continue;
			elem.removeAttribute(name);
		}

	}

	/**
	 * Remove dangerous stuff from the HTML document's nodes
	 * @param  {Node} html The HTML document
	 */
	function clean (html) {
		let nodes = html.children;
		for (let node of nodes) {
			removeAttributes(node);
			clean(node);
		}
	}

	// Convert the string to HTML
	let html = stringToHTML();

	// Sanitize it
	removeScripts(html);
	clean(html);

	// If the user wants HTML nodes back, return them
	// Otherwise, pass a sanitized string back
	return nodes ? html.childNodes : html.innerHTML;
}