var sakai = sakai || {};

sakai.notepaper = function(tuid, showSettinds) {
    var $editArea = $("#edit_area");
    
    var loadData = function() {
        $.ajax({
            url:"/system/notepaper",
            type: "GET",
            success: function(data) {
                var json = jQuery.parseJSON(data);
                if(json.message){
                    $editArea.val(json.message);
                    $("#time").html(json.modifyTime);
                }else{
                    $("#timeDIV").hide();
                }
                $editArea.scrollTop(1000);
                $editArea.height($editArea.height() + $editArea.scrollTop());
            },
            error: function() {
                alert("error");
            },
        });
    };
    
    ///////////////////
    // Save the note //
    ///////////////////
    var saveData = function(message) {
        $.ajax({
            url:"/system/notepaper",
            type: "POST",
            data: {
                "message": message
            },
            success: function(data) {
                var json = jQuery.parseJSON(data);
                $("#time").html(json.modifyTime);
                $("#timeDIV").show();
            },
            error: function() {
                alert("Error:can not save your message :" + message);
            },
        });
    };
    
    ////////////////////////////
    // Autoresize the textarea //
    ////////////////////////////
    var autoresize = function(){
        
        var settings = {
                            extraSpace : 16,
                            limit: 1000
                        };
        var lastScrollTop = null;
        var origHeight = $editArea.height();
        //clone the textarea for getting the scrollTop
        var clone = $editArea.clone().insertBefore("#edit_area");
        
        var updateSize = function() {
            clone.height(0).val($editArea.val()).scrollTop(1000);
            var scrollTop = Math.max(clone.scrollTop(), origHeight) + settings.extraSpace;
            if (lastScrollTop === scrollTop) { return; }
            lastScrollTop = scrollTop;
            //show scrolls when get to the limit
            if ( scrollTop >= settings.limit ) {
                $(this).css('overflow-y','');
                return;
            }
            //resize the height
            $editArea.height(scrollTop);
        };
        updateSize();
        $editArea.live("keyup", updateSize);
        
    };
    
    var init = function() {
        loadData();
        autoresize();
        
        $editArea.live("focus", function() {
            $(this).css({"background-color":"#ffffcc","color":"black","border":"2px solid #f1ca65"});
        });
        
        $editArea.live("blur", function() {
            $(this).css({"background-color":"#ffffcc","color":"black","border":"2px solid white"});
        });
        
        $editArea.live("change", function() {
            saveData($(this).val());
        });
    };
    
    init();
    
};

sakai.api.Widgets.widgetLoader.informOnLoad("notepaper");