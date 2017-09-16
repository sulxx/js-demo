/* Resources.js
 * 这是一个简单的图片加载工具。他简化了图片加载的过程从而这些图片可以在你的游戏里面使用。
 * 这个工具还包含一个缓存层从而当你试图加载同一张图片多次的时候可以重复使用缓存的图片
 */

(function() {
    var resourceCache = {}; //所有已加载的图片 key是url，value是image对象
    var loading = [];
    var readyCallbacks = []; //加载完成后的回调函数

    /* 这是公开访问的图片加载函数, 它接受一个指向图片文件的字符串的数组或者是单个图片的
     * 路径字符串。然后再调用我们私有的图片加载函数。
     */
    function load(urlOrArr,callbacks) {
        if(urlOrArr instanceof Array) {
            urlOrArr.forEach(function(url) {
                _load(url,callbacks,urlOrArr); 
                //最开始会把所有图片的resourceCache[url]赋值false，某个图片加载完成后其对应的值会变成image对象。
                //isReady依次来判断。
            });
        } else {
            _load(urlOrArr,callbacks);
        }   
    }

    /* 这是我们私有的图片加载函数， 它会被公有的图片加载函数调用 */
    function _load(url,callbacks,urlArr) {
        var callbacks = callbacks || [];
        if(resourceCache[url]) {
            /* 如果这个 URL 之前已经被加载了，那么它会被放进我们的资源缓存数组里面，
             * 然后直接返回那张图片即可。
             */
            return resourceCache[url];
        } else {
            /* 否则， 这个 URL 之前没被加载过而且在缓存里面不存在，那么我们得加载这张图片
             */
            var img = new Image();
            img.onload = function() {
                /* 一旦我们的图片已经被加载了，就把它放进我们的缓存，然后我们在开发者试图
                 * 在未来再次加载这个图片的时候我们就可以简单的返回即可。
                 */
                resourceCache[url] = img;
                /* 一旦我们的图片已经被加载和缓存，调用所有我们已经定义的回调函数。
                 */
                if(isReady()) {
                    callbacks.forEach(function(func) {
                       //加载好后的图片（数组）作为参数传给回调函数。
                       urlArr!=undefined? func.call(null,urlArr):func.call(null,url); 
                    });
                }
                return resourceCache[url];
            };

            /* 将一开始的缓存值设置成 false 。在图片的 onload 事件回调被调用的时候会
             * 改变这个值。最后，将图片的 src 属性值设置成传进来的 URl 。
             */
            resourceCache[url] = false; //注意这个！
            img.src = url;
        }
    }

    /* 这个函数用来让开发者拿到他们已经加载的图片的引用。如果这个图片被缓存了，
     * 这个函数的作用和在那个 URL 上调用 load() 函数的作用一样。
     */
    function get(url) {
        if(resourceCache[url])
            return resourceCache[url];
        else
            return load(url);
    }

    /* 这个函数是否检查所有被请求加载的图片都已经被加载了。
     */
    function isReady() {
        var ready = true;
        for(var k in resourceCache) {
            if(resourceCache.hasOwnProperty(k) &&
               !resourceCache[k]) {
                ready = false;
            }
        }
        return ready;
    }

    /* 这个函数会在被请求的图片都被加载了这个事件的回调函数栈里面增加一个函数。*/
    function addCallback(func) {
        readyCallbacks.push(func);
    }

    function removeCallback(func) {
        readyCallbacks.pop(func);
    }

    /* 这个对象通过创造一个公共的资源对象来定义公有的开发者可以访问的函数。(闭包，用一个全局变量保存这些函数)*/
    window.Resources = {
        load: load,
        get: get,
        addCallback: addCallback,
        isReady: isReady
    };
})();
