import {html, PolymerElement} from '@polymer/polymer/polymer-element';
import '@polymer/paper-styles/element-styles/paper-material-styles';
import '@polymer/paper-styles/default-theme';
import '@polymer/paper-ripple/paper-ripple';

class NicePortalTile extends PolymerElement {
    static get template() {
        return html`
            <style include="paper-material-styles">
                :host {
                    display: inline-block;
                    position: relative;
                    box-sizing: border-box;
                    background-color: var(--paper-blue-grey-900); 
                    color: var(--paper-grey-200);
                    border-radius: 2px;
                    @apply --paper-font-common-base;
                    @apply --paper-card;
                    width: 169px;
                    height: 112px;
                    margin: 6px;
                    @apply --paper-material-elevation-1;
                    text-align: center;
                }
                :host(:hover) {
                    @apply --paper-material-elevation-2;
                }
                :host([active]) {
                    @apply --paper-material-elevation-3;
                }
                
                img {
                    max-height: 80%;
                    max-width: 90%;
                    user-select: none;
                }
                
                #img {
                    width: calc(100% - 12px);
                    height: 112px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                }
                
                :host([show-title]) #img {
                    height: 92px;
                }
                
                #title {
                    height: 20px;
                    width: 161px;
                    padding-left: 4px;
                    padding-right: 4px;
                    color: var(--paper-grey-400);
                    user-select: none;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                
                a:link, a:visited, a:hover, a:active {
                    text-decoration: none;
                    outline: none;
                    color: var(--paper-grey-400);
                }
            </style>
            
            <a draggable="false" id="anchor" href="[[href]]">
                <div id="img"><img draggable="false" src="[[img]]"></div>
                <template is="dom-if" if="[[showTitle]]">
                    <div id="title">[[title]]</div>
                </template>
                <paper-ripple id="ripple"></paper-ripple>
            </a>
        `;
    }

    static get properties() {
        return {
            showTitle: {
                type: Boolean
            },
            title: {
                type: String,
                observer: '_titleChanged'
            },
            tags: {
                type: String
            },
            img: {
                type: String
            },
            href: {
                type: String
            },
            active: {
                type: Boolean
            }
        };
    }

    _titleChanged(value) {
        if (value) {
            this.setAttribute('show-title', true);
        } else {
            this.removeAttribute('show-title');
        }
    }

    connectedCallback() {
        super.connectedCallback();
        this.$.anchor.addEventListener('blur', () => {
            this.$.ripple.upAction();
            this.removeAttribute('active');
        });
        this.$.anchor.addEventListener('focus', () => {
            this.setAttribute('active', true);
            this.$.ripple.downAction();
        });
        if (this.$.anchor.focused) {
            this.$.ripple.downAction();
        }
    }
}

window.customElements.define('nice-portal-tile', NicePortalTile);
