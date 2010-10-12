var uploadInit = function(){
    $(function(){
        $("#upload_pic").ajaxForm({
            success: function(data){
                var $responseData = $.parseJSON(data.replace("<pre>", "").replace("</pre>", ""));
                for (var i in $responseData) {
                    if ($responseData.hasOwnProperty(i)) {
                        var insertImg = "<img src=/p/" + $responseData[i] + ">";
                        // tinyMCE.getInstanceById("tiny_mce").getBody().innerHTML += insertImg;
                        $("#src").append(insertImg);
                    }
                }
            },
            error : function(){
                alert("Upload error!");
            }
        });
        
        $("#upload_pic").submit(function () {
            // validate args
            if($("#file").val()) {
                return AIM.submit(this, {
                    'onStart' : startCallback,
                    'onComplete' : completeCallback
                });
            } else {
                // no input, show error
                alert("No file selected!");
                return false;
            }
        });
        
        var startCallback = function() {
            return true;
        };
        
        var completeCallback = function(response) {
        };
        
        var AIM = {
        
            frame : function(c) {
                var n = 'f' + Math.floor(Math.random() * 99999);
                var d = document.createElement('DIV');
                d.innerHTML = '<iframe style="display:none" src="about:blank" id="'+n+'" name="'+n+'" onload="AIM.loaded(\''+n+'\')"></iframe>';
                document.body.appendChild(d);
        
                var i = document.getElementById(n);
                if (c && typeof(c.onComplete) === 'function') {
                    i.onComplete = c.onComplete;
                }
                return n;
            },
        
            form : function(f, name) {
                f.setAttribute('target', name);
            },
        
            submit : function(f, c) {
                AIM.form(f, AIM.frame(c));
                if (c && typeof(c.onStart) === 'function') {
                    return c.onStart();
                } else {
                    return true;
                }
            },
        
            loaded : function(id) {
                var i = document.getElementById(id);
                var d = null;
                if (i.contentDocument) {
                    d = i.contentDocument;
                } else if (i.contentWindow) {
                    d = i.contentWindow.document;
                } else {
                    d = window.frames[id].document;
                }
                if (d.location.href === "about:blank") {
                    return;
                }
        
                if (typeof(i.onComplete) === 'function') {
                    i.onComplete(d.body.innerHTML);
                }
            }
        };
        
        $("#upload_pic").attr("action", "/system/pool/createfile");
    });
};