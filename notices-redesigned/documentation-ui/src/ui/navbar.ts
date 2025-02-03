class Navbar {
    constructor(options = {}) {
        this.options = {
            title: 'Documentation',
            links: [],
            ...options
        };
    }

    addLink(link) {
        this.options.links.push(link);
    }

    render() {
        const navbar = document.createElement('nav');
        navbar.className = 'navbar';
        navbar.setAttribute('role', 'navigation');
        navbar.innerHTML = `
            <div class="container">
                <a href="../index.html">${this.options.title}</a>
                ${this.options.links.map(link => 
                    `<a href="${link.url}">${link.title}</a>`
                ).join('')}
            </div>
        `;
        return navbar;
    }
}

export default Navbar;