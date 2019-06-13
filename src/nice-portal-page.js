import {html, PolymerElement} from '@polymer/polymer/polymer-element';
import './nice-portal-tile';

class NicePortalPage extends PolymerElement {
    static get template() {
        return html`
            <style>
                h3 {
                    padding: 12px 6px 0;
                    margin: 0;
                    color: #fff;
                    background-color: var(--paper-blue-grey-800);
                }
                #container {
                    padding: 6px;
                    display: flex;
                    flex-direction: row;
                    flex-wrap: wrap;
                    background-color: var(--paper-blue-grey-800);
                }
            </style>
            <h3>[[title]]</h3>
            <div id="container">
                <dom-repeat items="[[tiles]]">
                    <template>
                        <nice-portal-tile id="tile-[[index]]" img="[[item.img]]" href="[[item.href]]" title="[[item.title]]" tags="[[item.tags]]"></nice-portal-tile>
                    </template>
                </dom-repeat>
            </div>
        `;
    }

    static get properties() {
        return {
            title: {
                type: String
            },
            tiles: {
                type: Array
            }
        };
    }
}

window.customElements.define('nice-portal-page', NicePortalPage);
