
/**
 * @name sakai.news
 *
 * @class news
 *
 * @description
 * List the news in this widget
 *
 * @version 0.0.1
 * @param {String} tuid Unique id of the widget
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.news = function(tuid, showSettings){
    var $newsList = $("#news_list");
    var $newTitle = $(".news_title");
    var $newsListError = $("#news_list_error");
    var $newsListEmpty = $("#news_list_empty");
    var $newsListError = $("#news_list_error");
    var $newsListTemplate = $("#news_list_template");
    var $createnewsAddSaveEdit = $("#createnews_add_save_edit");
    var $createnewsAddSaveNew = $("#createnews_add_save_new"); 
    var $createnewsAddSaveCancel = $("#createnews_add_save_cancel");
    var $createnewsLink = $("#create_news_link");
    var $createnewsContainer = $("#createnews_container");
    var $createNewsTipNew = $("#createnews_tip_new");
    var $createNewsTipEdit = $("#createnews_tip_edit");
    var $haveRightToShow = $(".have_right_to_show");

    var maxTextNumber = 27;
    
    //judge user's right
    var userRightJudgement = function(){
      var me = sakai.data.me;
      if(sakai.api.Security.saneHTML(sakai.api.User.getProfileBasicElementValue(me.profile, "firstName")) === "Admin"){
        $(".have_right_to_show").show();
      }
    }
    
    // limite the text number of each title of news
    var newsTitleShowLimite = function(){
      $newTitle.each(function () {
          if ($(this).text().length > maxTextNumber) {
              $(this).text($(this).text().substring(0, maxTextNumber));
              $(this).text($(this).text() + "...");
          }
      });
    }
    
    var loadData = function(){
        $.ajax({
//          url: "/devwidgets/news/data/news.json",
            url: "/system/news",
            data:{
              "action":"indexList"
            },
            type: "GET",
            success: function(data){
              if(data.success){
                if(data.newsList.length === 0){
                  $newsListEmpty.show();
                }else{
                  $newsList.html($.TemplateRenderer($newsListTemplate, data));
                  $newsList.show();
                  newsTitleShowLimite();
                }
              }else{
                $newsListError.show();
              }
            },
            error: function(){
                $newsListError.show();
            }
        });
    };
    
    $createnewsLink.live("click", function(ev){
        // Load the creategroup widget.
        sakai.createnews.initialise();
        // $createnewsContainer.jqmShow();
        $createNewsTipEdit.hide();
        $createNewsTipNew.show(); 
        $createnewsAddSaveEdit.hide(); 
        $createnewsAddSaveNew.show(); 
        $createnewsAddSaveCancel.show(); 
    });
    
    var init = function(){
      userRightJudgement();
      loadData(); 
    };
     
    init();
};

sakai.api.Widgets.widgetLoader.informOnLoad("notice");