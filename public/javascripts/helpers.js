(function() {
    "use strict";

    var defaultAction;
    var bucket = window.location.href;
    var pos = bucket.lastIndexOf('/');
    if (pos > 0 && pos < (bucket.length - 1)) {
        bucket = bucket.substring(pos + 1);
    }

    window.Manager = {
        bucket : bucket,
        declare : function() {
        },
        highlight : function() {
        },
        registered : [],
        addToolbarButton : function(text, onclick, toolbarID) {
            window.Manager.declare(onclick);
            var button = document.createElement('button');
            button.type = 'button';
            button.className = 'cesium-button';
            button.onclick = function() {
                window.Manager.reset();
                window.Manager.highlight(onclick);
                onclick();
            };
            button.textContent = text;
            document.getElementById(toolbarID || 'toolbar').appendChild(button);
        },
        addDefaultToolbarButton : function(text, onclick, toolbarID) {
            window.Manager.addToolbarButton(text, onclick, toolbarID);
            defaultAction = onclick;
        },
        addDefaultToolbarMenu : function(options, toolbarID) {
            window.Manager.addToolbarMenu(options, toolbarID);
            defaultAction = options[0].onselect;
        },
        addToolbarMenu : function(options, toolbarID) {
            var menu = document.createElement('select');
            menu.className = 'cesium-button';
            menu.onchange = function() {
                window.Manager.reset();
                var item = options[menu.selectedIndex];
                if (item && typeof item.onselect === 'function') {
                    item.onselect();
                }
            };
            document.getElementById(toolbarID || 'toolbar').appendChild(menu);

            if (!defaultAction && typeof options[0].onselect === 'function') {
                defaultAction = options[0].onselect;
            }

            for (var i = 0, len = options.length; i < len; ++i) {
                var option = document.createElement('option');
                option.textContent = options[i].text;
                option.value = options[i].value;
                menu.appendChild(option);
            }
        },
        reset : function() {
        }
    };
}());
