// 字体加载优化脚本
(function() {
    'use strict';
    
    // 检查字体是否已加载
    function isFontLoaded(fontFamily) {
        return document.fonts.check('1em ' + fontFamily);
    }
    
    // 等待字体加载完成
    function waitForFont(fontFamily, callback) {
        if (isFontLoaded(fontFamily)) {
            callback();
            return;
        }
        
        document.fonts.ready.then(function() {
            if (isFontLoaded(fontFamily)) {
                callback();
            }
        });
    }
    
    // 添加字体加载类
    function addFontLoadedClass() {
        document.body.classList.add('font-loaded');
        document.body.classList.remove('font-loading');
    }
    
    // 初始化字体加载
    function initFontLoading() {
        // 添加加载状态类
        document.body.classList.add('font-loading');
        
        // 等待鹜霞文楷字体加载
        waitForFont('LxgwWenKai', function() {
            addFontLoadedClass();
            console.log('鹜霞文楷字体加载完成');
        });
        
        // 设置超时，确保页面不会一直等待
        setTimeout(function() {
            if (!document.body.classList.contains('font-loaded')) {
                addFontLoadedClass();
                console.log('字体加载超时，使用备用字体');
            }
        }, 3000);
    }
    
    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFontLoading);
    } else {
        initFontLoading();
    }
})();
