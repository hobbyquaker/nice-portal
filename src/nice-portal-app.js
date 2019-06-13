import {html, PolymerElement} from '@polymer/polymer/polymer-element';
import './nice-portal-page';
import '@polymer/app-layout/app-toolbar/app-toolbar';
import '@polymer/font-roboto';
import '@polymer/iron-icons';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-icon-button';

/**
 * @customElement
 * @polymer
 */
class NicePortalApp extends PolymerElement {
    static get template() {
        return html`
        <style>
            :host {
                font-family: Roboto, Noto, sans-serif;
                position: absolute;
                width: 100%;
                height: 100%;
                display: block;
                background-color: var(--paper-blue-grey-800);
            }
              
            app-toolbar {
                background-color: var(--paper-blue-grey-900);
                color: #fff;
                margin: 0 0;
            }
            
            paper-icon-button {
                --paper-icon-button-ink-color: white;
            }
            
            paper-progress {
                display: block;
                width: 100%;
                --paper-progress-active-color: rgba(255, 255, 255, 0.5);
                --paper-progress-container-color: transparent;
            }
            
            paper-icon-button + [main-title] {
                margin-left: 24px;
            }
            .links {
                margin-left: 6px;
            }
            .links a:link, .links a:visited, .links a:hover, .links a:active {
                font-size: 11px;
                text-decoration: none;
                color: var(--paper-grey-400);
            }
            paper-input {
                margin-top: -20px;
                --paper-input-container-input-color: var(--paper-grey-400);
                --paper-input-container-color: var(--paper-blue-grey-800);
                --paper-input-container-focus-color: var(--paper-blue-grey-400);
            }
            
            #container {
                display: flex;
                flex-direction: row;
            }
            #left, #right {
                flex-grow: 1;
            }
            #content {
                max-width: 1600px;
            }
        </style>

        <app-toolbar>
            <div main-title>[[title]]</div>
            <paper-input id="search" value="{{search}}">
                <iron-icon slot="prefix" icon="search"></iron-icon>
                <paper-icon-button tabindex="-1" slot="suffix" id="clearSearch" icon="clear" alt="clear" title="clear">
                </paper-icon-button>
            </paper-input>
            
        </app-toolbar>
        <div id="container">
            <div id="left"></div>
            <div id="content">
                <dom-repeat items="[[data]]">
                    <template>
                        <nice-portal-page title="[[item.title]]" tiles="[[item.tiles]]"></nice-portal-page>
                    </template>
                </dom-repeat>
            </div>
            <div id="right"></div>
        </div>
    `;
    }

    static get properties() {
        return {
            title: {
                type: String
            },
            search: {
                type: String,
                observer: '_searchChanged'
            }
        };
    }

    connectedCallback() {
        super.connectedCallback();
        fetch('./config.json').then(res => {
            return res.json();
        }).then(config => {
            if (config.title) {
                this.title = config.title;
                document.querySelector('title').innerHTML = this.title;
            }

            this.src = config.pages;
            this.data = this.src;
        });

        document.addEventListener('keydown', event => {
            switch (event.key) {
                case 'Escape':
                    this.$.search.value = '';
                    break;

                case 'Enter':
                    if (this.visibleCount === 1) {
                        const link = this.shadowRoot.querySelector('nice-portal-page').shadowRoot.querySelector('nice-portal-tile').shadowRoot.querySelector('a');
                        link.focus();
                        link.click();
                        break;
                    }

                case ' ': { // eslint-disable-line no-fallthrough
                    const {tile} = this._getActive();
                    if (tile) {
                        tile.shadowRoot.querySelector('#anchor').click();
                        event.preventDefault();
                        return false;
                    }

                    break;
                }

                case 'Tab':
                    if (this.$.search.focused || this.$clearSearch.focused) {
                        const link = this.shadowRoot.querySelector('nice-portal-page').shadowRoot.querySelector('nice-portal-tile').shadowRoot.querySelector('a');
                        link.focus();
                        event.preventDefault();
                        return false;
                    }

                    break;

                case 'ShiftLeft':
                case 'Shift':
                case 'ShiftRight':
                    break;

                case 'ArrowLeft':
                    if (!this.$.search.focused) {
                        this._selectLeft();
                    }

                    break;
                case 'ArrowRight':
                    if (!this.$.search.focused) {
                        this._selectRight();
                    }

                    break;
                case 'ArrowUp':
                    if (!this.$.search.focused && this._selectUp()) {
                        event.preventDefault();
                        return false;
                    }

                    break;

                case 'ArrowDown':
                    if (!this.$.search.focused && this._selectDown()) {
                        event.preventDefault();
                        return false;
                    }

                    break;

                default:
                    if (!this.$.search.focused) {
                        this.$.search.focus();
                    }
            }
        });

        this.$.clearSearch.addEventListener('click', () => {
            this.$.search.value = '';
        });
    }

    _selectDown(inc = 1, nextPage = false) {
        const {page: cpage, tile} = this._getActive();
        if (!tile) {
            this.shadowRoot.querySelector('nice-portal-page').shadowRoot.querySelector('nice-portal-tile').shadowRoot.querySelector('#anchor').focus();
            return true;
        }

        const page = nextPage ? cpage.nextElementSibling : cpage;
        const {x: cx} = tile.getBoundingClientRect();

        if (!page || !page.shadowRoot) {
            return null;
        }

        const id = 'tile-' + ((nextPage ? 0 : Number(tile.id.replace('tile-', ''))) + inc);
        const next = page.shadowRoot.querySelector('#' + id);

        if (!next && nextPage) {
            return null;
        }

        if (!next) {
            return this._selectDown(0, true);
        }

        const {x: nx} = next.getBoundingClientRect();

        if (nx === cx) {
            next.shadowRoot.querySelector('a').focus();
            return true;
        }

        return this._selectDown(inc + 1, nextPage);
    }

    _selectUp(inc = 1, prevPage = false) {
        const {page: cpage, tile} = this._getActive();
        if (!tile) {
            this.shadowRoot.querySelector('nice-portal-page').shadowRoot.querySelector('nice-portal-tile').shadowRoot.querySelector('#anchor').focus();
            return true;
        }

        const page = prevPage ? cpage.previousElementSibling : cpage;
        const {x: cx} = tile.getBoundingClientRect();

        const id = 'tile-' + ((Number((prevPage ? page.shadowRoot.querySelector('nice-portal-tile:last-of-type').id : tile.id).replace('tile-', ''))) - inc);
        const next = page.shadowRoot.querySelector('#' + id);

        if (!next && prevPage) {
            return null;
        }

        if (!next) {
            return this._selectUp(0, true);
        }

        const {x: nx} = next.getBoundingClientRect();

        if (nx === cx) {
            next.shadowRoot.querySelector('a').focus();
            return true;
        }

        return this._selectUp(inc + 1, prevPage);
    }

    _selectRight() {
        const {page, tile} = this._getActive();
        if (!tile) {
            this.shadowRoot.querySelector('nice-portal-page').shadowRoot.querySelector('nice-portal-tile').shadowRoot.querySelector('#anchor').focus();
            return true;
        }

        const {x: cx} = tile.getBoundingClientRect();

        const id = 'tile-' + (Number(tile.id.replace('tile-', '')) + 1);
        const next = page.shadowRoot.querySelector('#' + id);
        const {x: nx} = next.getBoundingClientRect();

        if (nx > cx) {
            next.shadowRoot.querySelector('a').focus();
        }
    }

    _selectLeft() {
        const {page, tile} = this._getActive();
        if (!tile) {
            this.shadowRoot.querySelector('nice-portal-page').shadowRoot.querySelector('nice-portal-tile').shadowRoot.querySelector('#anchor').focus();
            return true;
        }

        const {x: cx} = tile.getBoundingClientRect();

        const id = 'tile-' + (Number(tile.id.replace('tile-', '')) - 1);
        const next = page.shadowRoot.querySelector('#' + id);
        const {x: nx} = next.getBoundingClientRect();

        if (nx < cx) {
            next.shadowRoot.querySelector('a').focus();
        }
    }

    _getActive() {
        const res = {};
        this.shadowRoot.querySelectorAll('nice-portal-page').forEach(el => {
            const a = el.shadowRoot.querySelector('[active]');
            if (a) {
                res.page = el;
                res.tile = a;
            }
        });
        return res;
    }

    _searchChanged(val) {
        this.visibleCount = 0;
        this.data = this.src && this.src.map(page => {
            const terms = val.toLowerCase().trim().split(' ');
            const tiles = page.tiles.filter(tile => {
                const tags = tile.tags.toLowerCase();
                let match = true;
                terms.forEach(term => {
                    if (!tags.includes(term)) {
                        match = false;
                    }
                });
                return match;
            });
            this.visibleCount += tiles.length;
            return {
                title: page.title,
                tiles
            };
        }).filter(page => page.tiles.length);
    }
}

window.customElements.define('nice-portal-app', NicePortalApp);
