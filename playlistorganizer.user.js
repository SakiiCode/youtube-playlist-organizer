// ==UserScript==
// @name            YouTube (Modern) | Sort, Rearrange & Organize Playlists 2
// @namespace       de.sidneys.userscripts
// @homepage        https://gist.githubusercontent.com/sidneys/80250a913b84338926deede6e1608905/raw
// @version         1.1.1
// @description     Rearrange your YouTube playlists. Real server-side sorting by video title, channel and more. Now compatible with modern YouTube.
// @author          sidneys
// @icon            https://www.youtube.com/favicon.ico
// @noframes
// @include         http*://www.youtube.com/*
// @require         https://gitcdn.xyz/repo/sidneys/franc/fef2e1c1156734581455435001abb4a39f48d184/dist/franc-min.js
// @require         https://greasyfork.org/scripts/38888-greasemonkey-color-log/code/Greasemonkey%20%7C%20Color%20Log.js
// @require         https://greasyfork.org/scripts/374849-library-onelementready-es6/code/Library%20%7C%20onElementReady%20ES6.js
// @require         https://greasyfork.org/scripts/375023-library-queryselectorinterval/code/Library%20%7C%20querySelectorInterval.js
// @grant           GM.addStyle
// @run-at          document-start
// ==/UserScript==

/**
 * ESLint
 * @global
 */
/* global franc */
/* global onElementReady */
/* global querySelectorInterval */
/* global clearQuerySelectorInterval */
Debug = true


/**
 * @default
 * @constant
 */
const urlPath = '/playlist'

/**
 * Language detection whitelist
 * See {@link https://github.com/wooorm/franc/tree/master/packages/franc-min}
 * @default
 * @constant
 */
const languageList = [ 'eng', 'deu' ]

/**
 * Timer duration
 * @default
 * @constant
 */
const scrollPauseDuration = 10000
const movePauseDuration = 4000
const clickPauseDuration = 300


/**
 * Inject Stylesheet
 */
let injectStylesheet = () => {
    console.debug('injectStylesheet')

    GM.addStyle(`
    /* ==========================================================================
       ELEMENTS
       ========================================================================== */

    /* .advanced-playlist-editor-modern-container
       ========================================================================== */

    .advanced-playlist-editor-modern-container
    {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        padding: 0;
        margin-left: 0.5rem;
        opacity: 1 !important;
        animation: fade-in 200ms;
        transition: all 1000ms ease-in-out;
    }

    .advanced-playlist-editor-modern-container.fade-in
    {
        opacity: 1 !important;
        animation: fade-in 200ms;
    }

    /*
    html[dark="true"] .advanced-playlist-editor-modern-container
    {
        background-color: rgba(255, 255, 255, 0.1);
    }

    html:not([dark="true"]) .advanced-playlist-editor-modern-container
    {
        background-color: rgba(0, 0, 0, 0.1);
    }
    */

    /* .advanced-playlist-editor-modern-spinner
       ========================================================================== */

    .advanced-playlist-editor-modern-spinner
    {
        background-image: url(https://i.imgur.com/z4V4Os8.png);
        background-size: 100%;
        background-repeat: no-repeat;
        background-position: 50%;
        order: 2;
        flex: 1;
        margin-left: auto;
        height: 2em;
        min-width: 1.5rem;
        filter: opacity(0);
        transition: all 500ms ease-in-out !important;
    }

    /* .advanced-playlist-editor-modern-title
       ========================================================================== */

    .advanced-playlist-editor-modern-title
    {
        font-weight: normal;
        font-family: 'Roboto Mono', monospace;
        font-size: 0.60rem;
        line-height: 1.5;
        text-align: right;
        color: var(--yt-spec-text-secondary);
        order: 2;
        margin: auto;
        padding: 0.5rem;
        min-width: 4rem;
        flex: 10;
        white-space: inherit;
    }

    /* .advanced-playlist-editor-modern-button
       ========================================================================== */

    .advanced-playlist-editor-modern-button
    {
        order: 1;
        margin: 6px 3px;
        border-radius: 0 !important;
        -webkit-font-smoothing: subpixel-antialiased;
        -moz-osx-font-smoothing: grayscale;
        transition: all 500ms ease-in-out !important;
    }

    html[dark="true"] .advanced-playlist-editor-modern-button
    {
        border: 1px solid rgb(48, 48, 48) !important;
        background-color: rgb(48, 48, 48) !important;
    }

    html:not([dark="true"]) .advanced-playlist-editor-modern-button
    {
        border: 1px solid rgb(211, 211, 211) !important;
        background-color: rgb(248, 248, 248) !important;
    }

    html[dark="true"] .advanced-playlist-editor-modern-button:hover *
    {
        color: rgb(255, 255, 255);
    }

    html:not([dark="true"]) .advanced-playlist-editor-modern-button:hover *
    {
        color: hsl(0, 0%, 0%);
    }

    .advanced-playlist-editor-modern-button:hover
    {
        text-decoration: none;
    }

    .advanced-playlist-editor-modern-button-label
    {
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        width: 100%;
        display: inline-block;
        font-family: var(--paper-font-common-base_-_font-family);
        font-style: paper-button;
        font-size: 0.8rem;
        font-weight: 500;
        letter-spacing: .007px;
        text-transform: uppercase;
    }

    html[dark="true"] .advanced-playlist-editor-modern-button-label
    {
        color: var(--yt-spec-text-secondary);
    }

    html:not([dark="true"]) .advanced-playlist-editor-modern-button-label
    {
        color: hsl(0, 0%, 40%);
    }

    .advanced-playlist-editor-modern-button:last-child
    {
        margin-right: 6px;
    }

    .advanced-playlist-editor-modern-button b
    {
        font-weight: 800;
    }

    .advanced-playlist-editor-modern-button.warning *
    {
        color: rgb(255, 130, 50) !important;
    }

    .advanced-playlist-editor-modern-button.danger *
    {
        color: rgb(240, 0, 0) !important;
    }

    .advanced-playlist-editor-modern-button.clear
    {
        margin-left: 5px;
    }

    /* .busy
       ========================================================================== */

    .busy .advanced-playlist-editor-modern-button
    {
        pointer-events: none;
        cursor: default;
        filter: saturate(0.1) opacity(0.5) !important;
    }

    .busy .advanced-playlist-editor-modern-spinner
    {
        filter: opacity(1);
    }

    /* ==========================================================================
       ANIMATIONS
       ========================================================================== */

    @keyframes fade-in {
        from { opacity: 0 } to { opacity: 1 };
    }
    `)
}


/**
 * Get Container Element
 * @returns {Element}
 */
let getContainerElement = () => document.querySelector('.advanced-playlist-editor-modern-container')

/**
 * Generate menu container element
 */
let renderContainerElement = () => {
    console.debug('renderContainerElement')

    if (getContainerElement()) { return }

    const element = document.createElement('div')
    element.className = 'advanced-playlist-editor-modern-container'
    let innerHTML = '<div class="advanced-playlist-editor-modern-spinner yt-uix-button yt-uix-button-size-default"></div>';
    innerHTML += '<div class="advanced-playlist-editor-modern-title">';
    innerHTML += "${GM.info.script.name.replaceAll(' | ', '<br/>')} (v${GM.info.script.version})";
    innerHTML += '</div>';

    element.innerHTML = innerHTML;
    document.querySelector('ytd-playlist-video-list-renderer').prepend(element)

    element.classList.add('fade-in')
}

/**
 * Generate button element
 * @param {function} click - OnClick handler
 * @param {String=} label - Button Label
 * @param {String=} className - Additional CSS Class
 */
let renderButtonElement = (click = () => {}, label = '', className = '') => {
    console.debug('renderButtonElement')

    // Create button
    const element = document.createElement('paper-button')
    element.className = 'yt-uix-button yt-uix-button-size-default yt-uix-button-default advanced-playlist-editor-modern-button'
    if (!!className) { element.classList.add(className) }
    element.innerHTML = `<span class="yt-uix-button-content advanced-playlist-editor-modern-button-label">${label}</span>`
    element.onclick = click

    // Render button
    getContainerElement().appendChild(element)
}




/**
 * Youtube Playlist Item Model
 * @typedef {Object} YoutubePlaylistItem
 * @property {Number} position - Playlist position
 * @property {String} videoId - YouTube video id
 * @property {String} channel - YouTube video creator
 * @property {String} title - Video title
 * @property {Number} duration - Video duration in seconds
 * @property {String} language - Language
 * @property {Element} element - DOM element
 */

/**
 * Youtube Playlist Model
 * @class
 * @property {YoutubePlaylistItem[]} items - Youtube Playlist Items
 */
class PlaylistModel {
    /**
     * Reads DOM nodes of current playlist items Build virtual Playlist from all items
     */

    constructor() {

        console.debug('constructor')

        
        


    }



    async checkCurrentLength(){

        const currentLength = document.querySelectorAll('ytd-playlist-video-renderer').length;
        const playlistLength = parseInt(document.getElementById("stats").innerText.split(" ")[0]);
        console.debug("checking current length:"+currentLength + ", target:"+playlistLength);
        if(currentLength !== playlistLength){

            const sch = document.getElementsByTagName("ytd-app")[0].scrollHeight;
            console.debug("scrolling to "+sch);
            window.scrollTo(0,sch);
            await new Promise(resolve => setTimeout(resolve, scrollPauseDuration));
            console.debug('checkCurrentLength done')
            return false;
        }else{
            console.debug("length: "+currentLength+" continuing to playlist build");
            clearInterval(this.scrollInterval);
            this.continueConstructor();
            console.debug('checkCurrentLength done')
            return true;
        }

    }

    async init(){
        console.debug('init')
        let success = false;
        do{
           success = await this.checkCurrentLength();
        }while(!success);

        //this.scrollInterval = setInterval(() => this.checkCurrentLength(),1000,1000);
        console.debug("init done");

    }

    continueConstructor(){
                /**  @type {YoutubePlaylistItem[]} */
        this.items = Array.from(document.querySelectorAll('ytd-playlist-video-renderer')).map((/** Element */ element, index) => {
            // Position (Current position)
            const position = index

            // Video id
            const videoId = element.data.videoId || ''

            // Channel name
            const channel = element.querySelector('ytd-channel-name') ? element.querySelector('ytd-channel-name').innerText : ''

            // Video title
            const title = element.data.title.simpleText || ''

            // Video duration
            const duration = parseInt(element.data.lengthSeconds) || Infinity

            // Video language
            const language = franc(title, { whitelist: languageList })

            return {
                position,
                videoId,
                channel,
                title,
                duration,
                language,
                element
            }
        })

    }


    /**
     * Log playlist model to console
     * @private
     */
    log() {
        console.info('Internal Playlist Model:')
        this.items.forEach((video, index) => {
            console.info('\t️', `${index}.`, 'ℹ️', '(',video.position,')', '[Title]', video.title, '[Channel]', video.channel, '[Duration]', `${video.duration}s`, '[Language]', video.language)
        })
    }

    /**
     * Sort playlist items by multiple attributes
     * @param {String[]} attributeList - Sorting attributes
     */
    sort(attributeList) {

        console.debug('sort')

        // Sort playlist model
        this.items = this.items.sort((a, b) => {

            if (a[attributeList[0]] > b[attributeList[0]]) { return 1 }
            if (a[attributeList[0]] < b[attributeList[0]]) { return -1 }

            if (!attributeList[1]) { return 0 }

            if (a[attributeList[1]] > b[attributeList[1]]) { return 1 }
            if (a[attributeList[1]] < b[attributeList[1]]) { return -1 }

            return 0
        })

        // DEBUG
        if (Debug) { this.log() }
    }

    /**
     * Invert order ot playlist items
     */
    reverse() {
        console.debug('sort')

        // Sort playlist model
        this.items = this.items.reverse()

        // DEBUG
        if (Debug) { this.log() }
    }
}

/**
 * Renders playlist model to DOM by reordering items of the currently visible playlist
 * @param {PlaylistModel} playlist - YouTube Playlist Model
 */
let renderPlaylistToDom = async (playlist) => {
    console.debug('renderPlaylistToDom')


    // Re-order playlist items in DOM
    var index = 0

        //let isVisible = document.body.contains(playlist.items[index].element);




    const callback = async() => {


        const playlistItem = playlist.items[index];
        const playlistItemIndex = playlistItem.position;
        const playlistItemElement = document.querySelectorAll("ytd-playlist-video-renderer")[playlistItemIndex];

        console.log("Moving "+playlistItemElement.querySelector("#video-title").textContent.trim());

        if (playlistItemElement) {
            // Click to open playlist item context menu
            const contextButtonElement = playlistItemElement.querySelector('ytd-menu-renderer yt-icon-button')
            contextButtonElement.click()

            // DEBUG
            console.debug('contextButtonElement', contextButtonElement)

            await new Promise(resolve => setTimeout(resolve, clickPauseDuration));

            // Lookup popup menu
            const contextMenuElementList = document.querySelectorAll('ytd-menu-popup-renderer > paper-listbox > ytd-menu-service-item-renderer')

            // Find index of context menu button with title "Move to bottom"
            if(new URLSearchParams(document.location.search.substring(1)).get("list")==="WL"){
                const moveDownButtonElement = contextMenuElementList[contextMenuElementList.length-1]
                // Click context menu button "Move to Bottom"
                moveDownButtonElement.click()
                // DEBUG
                console.debug('contextMenuElementList', contextMenuElementList)
                console.debug('moveDownButtonIndex', moveDownButtonIndex)
                console.debug('moveDownButtonElement', moveDownButtonElement)
            }else{
                const moveDownButtonElement = contextMenuElementList[contextMenuElementList.length-2]
                // Click context menu button "Move to Bottom"
                moveDownButtonElement.click()
                // DEBUG
                console.debug('contextMenuElementList', contextMenuElementList)
                console.debug('moveDownButtonIndex', moveDownButtonIndex)
                console.debug('moveDownButtonElement', moveDownButtonElement)

            }
            

            



            

            // Shift position list in internal model
            for(let i=0;i<playlist.items.length;i++){
                if(playlist.items[i].position > playlistItem.position){
                    playlist.items[i].position--;
                }

            }

            playlistItem.position=playlist.items.length-1;


            //playlist.log();

        }

        // Repeat
        if (index < playlist.items.length) {
            index++
        }

        // Last iteration
        if (index === playlist.items.length) {

            return true;
        }
        await new Promise(resolve => setTimeout(resolve, movePauseDuration));
        return false;

    }


    const scroller = async () => {
        let isVisible = document.querySelectorAll('ytd-playlist-video-renderer').length>=playlist.items[index].position;
        if(!isVisible){
            console.debug(index+ ". not visible ("+playlist.items[index].position+"), scrolling...");
            window.scrollTo(0,document.getElementsByTagName("ytd-app")[0].scrollHeight)
            await new Promise(resolve => setTimeout(resolve, scrollPauseDuration));
            return false;
        }else{
            console.debug(index+ ". visible now ("+playlist.items[index].position+"), reaching callback...");
            return true;
        }
    }

    let success = false;
    do{
        let scrollSuccess = false;
        do{
          scrollSuccess = await scroller();
        }while(!scrollSuccess);

        success = await callback();

    }while (!success);




}


/**
 * Clears currently visible YouTube playlist in DOM by removing all items (User clicked "Remove All")
 */
let removePlaylistItemsFromDom = () => {
    console.debug('removePlaylistItemsFromDom')


    // Remove all playlist items from DOM
    let requestId
    let lookup = () => {
        // Lookup first playlist item
        const element = document.querySelector('ytd-playlist-video-renderer')

        // No playlist items found
        if (!element) {
            // Exit loop
            window.cancelAnimationFrame(requestId)


            return
        }

        // Show popup menu for item
        element.querySelector('ytd-menu-renderer yt-icon-button').click()

        // Wait for popup menu
        const timeout = setTimeout(() => {
            // Lookup popup menu
            const buttonElementList = document.querySelectorAll('ytd-menu-popup-renderer > paper-listbox > ytd-menu-service-item-renderer')

            // Lookup button ("Move to bottom")
            if(new URLSearchParams(document.location.search.substring(1)).get("list")==="WL"){
                const buttonElement = buttonElementList[buttonElementList.length - 3]
                // Click button
                buttonElement.click()
            }else{
                const buttonElement = buttonElementList[buttonElementList.length - 4]
                // Click button
                buttonElement.click()

            }

            // Clear timer
            clearTimeout(timeout)
        }, clickPauseDuration)

        // Repeat loop
        requestId = window.requestAnimationFrame(lookup)
    }

    // Start loop
    requestId = window.requestAnimationFrame(lookup)
}


/**
 * Add Button: Sorting
 * @param {Array} attributeList - Sorting attributes
 */
let addSortButton = (attributeList) => {
    console.debug('addSortButton')

    const label = `⬆︎ ${attributeList.join(', ')}`

    renderButtonElement(() => {
        // Create playlist model
        // noinspection JSValidateTypes





        const playlist = new PlaylistModel();
        playlist.init().then( async () =>{
            playlist.sort(attributeList);

            // Render playlist model
            await renderPlaylistToDom(playlist);
        });




    }, label)
}

/**
 * Add Button: Reverse
 */
let addReverseButton = () => {
    console.debug('addReverseButton')

    const label = `⬆︎⬇︎ Reverse`
    const className = 'warning'

    renderButtonElement(() => {
        // Create playlist model
        // noinspection JSValidateTypes
        const playlist = new PlaylistModel()

        playlist.init().then( async () => {
            // Sort playlist model
            playlist.reverse();
            // Render playlist model
            await renderPlaylistToDom(playlist);
        });

    }, label, className)
}

/**
 * Add Button: Remove All
 */
let addRemoveAllButton = () => {
    console.debug('addRemoveAllButton')

    const label = `╳ Clear`
    const className = 'danger'

    renderButtonElement(() => {
        // Render playlist model
        removePlaylistItemsFromDom()
    }, label, className)
}


/**
 * Init
 */
let init = () => {
    console.info('init')

    // Check URL
    if (!location.pathname.startsWith(urlPath)) { return }

    // Add Stylesheet
    injectStylesheet()

    // Wait for Playlist Menu
    onElementReady('#sort-filter-menu', true, () => {
        // Add container
        renderContainerElement()
        // Add buttons
        addSortButton([ 'channel' ])
        addSortButton([ 'channel', 'duration' ])
        addSortButton([ 'language' ])
        addSortButton([ 'language', 'duration' ])
        addSortButton([ 'duration' ])
        addSortButton([ 'title' ])
        addReverseButton()
        addRemoveAllButton()
    })
}

/**
 * Detect In-Page Navigation
 * @listens document:Event#yt-navigate-finish
 */
document.addEventListener('yt-navigate-finish', () => {
    console.debug('document#yt-navigate-finish')

    init()
})
