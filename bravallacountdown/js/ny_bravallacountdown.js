// * * *
// "Main"

// Global variables,
var g_grid_size       = 20;
var g_tags_to_fetch   = ["bråvalla2013", "bråvalla2014", "bråvalla2015", "bråvalla"].sort(function() { return 0.5 - Math.random() });
var g_verbose         = 0;

var g_slots_all     = new Array();                          // To store the numbers representing the all slots,
var g_slots_for_tag = new Array();                          // To store the arrays containing the slots for each tag
var g_slots_per_tag = g_grid_size / g_tags_to_fetch.length; // To store the amount of slots per tag
var g_images_invalid = {};



function setup_page(){
  // Initialize the grid,
  initialize_grid(g_grid_size);

  // Randomize the slots,
  g_slots_all.sort(function() { return 0.5 - Math.random() });

  // Assign the slots to the different tags,
  assign_slots_to_tags();

  // Add the invalid images header (for debugging),
  add_invalid_images_header();

  // Get the images from insta,
  for (var tag = 0; tag < g_tags_to_fetch.length; tag++){
    fetch_images_from_insta(g_tags_to_fetch[tag]);
  }
}


function randomDate(start, end, x) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}




//console.log('%c red text, %c green bg', 'color: red', 'background: green' ); %c

// * * *
// Function definitions,





// Function for adding the invalid images header.
//
// Arguments : None.
// Returns   : Doesn't return in that sense.
//
function add_invalid_images_header(){

  if (g_verbose){
    var instafeed_invalid_div   = '<div id="instafeed_invalid">';
        instafeed_invalid_div  += '</div>';

    $('.container').append(instafeed_invalid_div);
    $('#instafeed_invalid').css("padding", "150px 0px 0px 20px");

    var instafeed_invalid  = '<span style="font-size:30px; font-weight:bold">';
        instafeed_invalid += '  Debug information : '
        instafeed_invalid += '</span><p>';
    $('#instafeed_invalid').append(instafeed_invalid);

     for (var key in g_images_invalid){
       var instafeed_invalid_str  = '<div id=images_invalid_'+key+'></div>';
       $("#instafeed_invalid").append(instafeed_invalid_str);
     }

  }
}



// Function for initializing the grid of image slots,
//
// Arguments : The gridsize.
// Returns   : Doesn't return in that sense.
//
function initialize_grid(grid_size){
  logger("Constructing a grid of "+grid_size+" thumbnails.");

  for (row = 0; row < grid_size; row++) {
    var w = 1;
    w = 1 + 2 * Math.random() << 0;

    var   thumb  = '<div class="brick" style=\'width:'+w*150+'px;\'>'
          thumb += '  <div class="thumbnail text-center scaling">'
          thumb += '    <strong id="caption_'+row+'"></strong>'
          thumb += '    <div class="spinner" id="spinner_'+row+'"/>'
          thumb += '      <a href="#" id="link_'+row+'" target="_blank">'
          thumb += '        <img id="thumb_'+row+'" src="#" class="fade">'
          thumb += '      </a>'
          thumb += '      <span>'
          thumb += '        <i id="likes_'+row+'" class="glyphicon glyphicon-heart likes" "></i>&nbsp; '
          thumb += '      </span>'
          thumb += '      <span>'
          thumb += '        <i id="comments_'+row+'" class="glyphicon glyphicon-comment comments"></i>&nbsp; '
          thumb += '      </span>'
          thumb += '    </div>'
          thumb += '  </div>'
          thumb += '</div>'

    $("#instafeed").append(thumb);
    g_slots_all.push(+row);
  }
}




// Function for assigning the slots from the grid to each tag.
//
// Arguments : None
// Returns   : Doesn't return in that sense.
//
function assign_slots_to_tags() {
  // For each tag,
  logger("Amounts of slots per tag = "+g_slots_per_tag);
  for (tag = 0; tag < g_tags_to_fetch.length; tag++){

    // Define an array for each tag that is going to contain the slots,
    g_slots_for_tag[g_tags_to_fetch[tag]] = new Array;
    g_images_invalid[g_tags_to_fetch[tag]] = {};

    g_images_invalid[g_tags_to_fetch[tag]]["date"]  = 0;
    g_images_invalid[g_tags_to_fetch[tag]]["frame"] = 0;

    logger("Creating \"tagarray\" '"+g_tags_to_fetch[tag]+"'");

    // Foreach slot per tag
    for (slot = 0; slot < g_slots_per_tag; slot++){
      // This is hacky, but I'm to tired to do anything about it now,
      if (g_slots_all.length === 0) break;
      if (typeof g_slots_all[slot] == "undefined") slot = 0;

      // Push the actual slot number onto the array,
      logger("Assigning slot '"+g_slots_all[slot]+"' into \"tagarray '"+g_tags_to_fetch[tag]+"'\"");
      g_slots_for_tag[g_tags_to_fetch[tag]].push(g_slots_all[slot]);

      // Delete the slot from the original array,
      g_slots_all.splice(slot,1);
    }
  }
  logger("All slots randomly assigned to tags.");
}




// Function for fetching images from instagram with instafeed.
// Using our own function for inserting the results into the dom since we want
// to do some "validation" of the images before inserting them.
//
// Arguments : Tag to fetch.
// Returns   : Doesn't return in that sense.
//
function fetch_images_from_insta(tag){
  var sort_by_items = ["most-recent", "least-recent", "most-liked", "least-liked","most-commented","least-commented","random"];
  var sort_by = sort_by_items[Math.floor(Math.random()*sort_by_items.length)];

  logger("Fetching images from instagram for tag '"+tag+"' sorted by '"+sort_by+"'");

  // Create the instafeed,
  var feed = new Instafeed({
        get       : 'tagged',                             // Get images that are "tagged",
        tagName   : tag,                                  // The actual tag to get,
        clientId  : 'eb01b1b10b72457ea650f74f756bde4a',   // The instadeveloper client id,
        mock      : 'true',                               // Don't automatically inject received pictures into the dom,
   //     limit     : g_slots_per_tag,                      // Fetch equally amount of images for each tag,
        sortBy    : sort_by,                             // Sort the results randomly
        resolution : 'standard_resolution',

        // Define custom function for when the instafeed success
        success   : function(instafeed_return) {
          logger("Instafeed data return length"+instafeed_return.data.length);
          for (var image = 0; image < instafeed_return.data.length; image++) {
            validate_image(instafeed_return.data[image],feed,instafeed_return.data.length,image);
          }
        },

        // FIXME
        error : function() {
        },
        after: function(){
        }
    });

  // Execute the feed,
  feed.run();
}


// Function for getting an "free slot" from the grid.
//
// Arguments : None.
// Returns   : Slot id if there is one, 0 otherwise.
//
function get_slot_from_tag(tag){

  if (g_slots_for_tag[tag].length){
    logger("Returning slot "+g_slots_for_tag[tag][0]);
    return g_slots_for_tag[tag][0];
  }

  // No free slots,
  logger("Returning empty (no slots available) for tag '"+tag+"'");
  return "--empty--";
}




// Function for adding the instagram image information to the slot
//
// Arguments : instaafeed image data object, instafeed object, string
// Returns   : Doesn't really return in that sense.
//
function add_image_to_grid (image_data,feed,image_created){

    // Get a "free slot" from the grid,
    var slot_num = get_slot_from_tag(feed.options.tagName);

    if (slot_num == "--empty--"){
      logger('Not adding image '+image_data.link+' to slot '+slot_num+' for '+feed.options.tagName);
      return;
    }

    logger('Adding image '+image_data.link+' to slot '+slot_num+' for '+feed.options.tagName);

    // Add the relevant image information to the free slot,
    $("#caption_"+slot_num).text(image_created);
    //$("#caption_"+slot_num).text(feed.options.tagName);
    $("#thumb_"+slot_num).attr("src", image_data.images.standard_resolution.url);
    //$("#thumb_"+slot_num).attr("title", image_data.id);
    $("#thumb_"+slot_num).attr("title", image_data.caption.text);
    $("#thumb_"+slot_num).show();
    $("#spinner_"+slot_num).hide();
    $("#link_"+slot_num).attr("href", image_data.link);

    if (image_data.comments.count === 0){
      $('#comments_'+slot_num).hide();
      $('#comments_'+slot_num).closest('span').css( "margin", "0px" );
    }else{
      $('#comments_'+slot_num).after("&nbsp;"+image_data.comments.count);
    }

    if (image_data.likes.count === 7){
      $('#likes_'+slot_num).hide();
      $('#likes_'+slot_num).closest('span').css( "margin", "0px" );
    }else{
      $('#likes_'+slot_num).after("&nbsp;"+image_data.likes.count);
    }

    // Delete the slot from the tag,
    g_slots_for_tag[feed.options.tagName].splice(0,1);
}




// Function for adding invalidated images onto the dom,
//
// Arguments : instaafeed image data object, instafeed object, string
// Returns   : Doesn't really return in that sense.
//
function add_invalidated_image(image_data, feed, reason){

  logger("Invalidated image for tag "+feed.options.tagName+", reason is : '"+reason+"'");
  g_images_invalid[feed.options.tagName][reason]++;

  // Add debug to dom if verbose flag is set,
  if (g_verbose){
    var img_invalid_tot  = 0;
    var img_invalid_str  = '<span style="padding-top:40px; display:block">';
        img_invalid_str += '  Total invalidated images for tag ';
        img_invalid_str += '\'<strong>'+feed.options.tagName+'</strong>\'';
        img_invalid_str += '</span>';

    // Foreach tag,
    for (var key in g_images_invalid[feed.options.tagName]){

      // Make it easy to read,
      img_invalid_str += '<span style="padding-left:15px; display:block"> ↳ by '
      img_invalid_str +=   key+' : ';
      img_invalid_str +=   '<strong>';
      img_invalid_str +=      g_images_invalid[feed.options.tagName][key]
      img_invalid_str +=   '</span></strong>';

      // Add up the total invalidated images
      img_invalid_tot += g_images_invalid[feed.options.tagName][key];
    }

      img_invalid_str += '<span style="padding-left:15px">'
      img_invalid_str += ' ↳ total : <strong>'+img_invalid_tot+'</strong>';
      img_invalid_str += '</span><br><br>';

      // Create image tag,
      var  img_invalid  = '<a href="'+image_data.link+'" >';
           img_invalid += '  <img style="border: 3px solid red; margin:5px"';
           img_invalid += '  src="'+image_data.images.thumbnail.url+'"';
           img_invalid += '  title="Invalidated by '+reason+'">';
           img_invalid += '</a>';

      // Add everything up,
      img_invalid_str += img_invalid;

      // Copy imgages, to tired, this should probably be done in another way
      var copy = $('#images_invalid_'+feed.options.tagName+' a').clone();

      // Update dom,
      $('#images_invalid_'+feed.options.tagName).html(img_invalid_str);
      $('#images_invalid_'+feed.options.tagName).append(copy);
  }
}


var invalid_ids = [ "1054256867027831737_12468441",
                   "1063947637353730022_466711394",
                   "792846076070261474_32253771",
                   "789741244245537382_32253771",
                   ];
                  


// Function for validating the picture gotten from instafeed,
//
// Arguments : instaafeed image data object, instafeed object
// Returns   : Doesn't really return in that sense.
//
function validate_image(image_data, feed, feed_length, total_images){

  for (invalid_id = 0; invalid_id < invalid_ids.length; invalid_id++){
    if (image_data.id === invalid_ids[invalid_id]){
      console.log("discarding image");
      return;
    }
  }

    // Create new image,
    var img = new Image();

    // Add the eventlistener so we can paint the canvas when the image is ready,
    img.addEventListener("load", function() {

      //total_images++;

      // Hack to get only get images tagged with a specific year.
      var year = feed.options.tagName.match(/\d+$/);
      var image_created_epoch = new Date(image_data.created_time * 1000)
      var image_created = image_created_epoch.toDateString()
      if (year){

        var date_start = randomDate(new Date(year, 01, 01), new Date(year,06,31));
        console.log("Random date start : "+date_start+" ("+date_start.getTime()+")");

        var random_days = Math.floor(Math.random()*(150-90+1)+90);;
        console.log("Random days : "+random_days);

        var date_end = new Date(date_start.getTime());
            date_end.setDate(date_end.getDate() + random_days);
        console.log("Random date end => "+date_end+" ("+date_end.getTime()+")");

        // Create a date object with the date from the image and stringify it,
        logger("Tag "+feed.options.tagName+" contains year '"+year+"'")

          if (image_created_epoch.getTime < date_start.getTime() || image_created_epoch.getTime() > date_end.getTime()){
        //  if (image_created.indexOf(year) === -1){
            var err_str  = "Date "+image_created+" it not between the dates '"
                err_str += date_start+"' and '"+date_end+"'";
            logger(err_str);
            add_invalidated_image(image_data,feed,"date")

            // If it's the last image of the feed, check so we have filled all
            // slots if not, we try to get more,
            logger("Before if tag (date) "+feed.options.tagName+", total images "+total_images+" feed_length "+feed_length);
            if (total_images === feed_length-1){
              logger("Last image in feed reached, checking if we need more images (year-validation) for tag "+feed.options.tagName);
              //total_images = 0;
              fill_empty_slots(feed);
              return;
            }
            return;
        }
      }

      // Draw the picture in the canvas element,
      var context = document.getElementById('canvas').getContext('2d');
          context.drawImage(img, 0, 0);

      // Get a rectangle 10 pixels wide from top to bottom, and from top left to
      // right,
      var pix_left_to_bottom = context.getImageData(0, 0, 10, canvas.height).data;
      var pix_top_to_right   = context.getImageData(0, 0, canvas.width, 10).data;

      // Loop the pixels from the rectangles, if there is to much white we
      // *could be* dealing with a white frame, simply skip that image.
      // 500 is value that seems to do what I want, feel free to improve
      // this part though. We get some false positives, but I can live with that.
      var probably_white_border = 0;
      for (var i = 0, n = pix_left_to_bottom.length; i < n; i += 4) {
        if (pix_left_to_bottom[i] > 250){
          probably_white_border++;
        }
      }

      for (var i = 0, n = pix_top_to_right.length; i < n; i += 4) {
        if (pix_top_to_right[i] > 250){
          probably_white_border++;
        }
      }

      // Image is bad, invalidate it,
      logger('Image'+image_data.images.thumbnail.url+' has a probabilty of white border : '+probably_white_border);
      if (probably_white_border > 1000){
        add_invalidated_image(image_data,feed,"frame");
      }else{
        // Image is all good, add it to the grid
        logger("Validated image "+image_data.images.thumbnail.url+" adding it to grid.");
        add_image_to_grid(image_data,feed,image_created);
      }

      // If it's the last image of the feed, check so we have filled all slots,
      // if not, we try to get more,
      logger("Before if tag "+feed.options.tagName+", total images "+total_images+" feed_length "+feed_length);
      if (total_images === feed_length-1){
        logger("Last image in feed reached, checking if we need more images (frame-validation) for tag "+feed.options.tagName);
        fill_empty_slots(feed);
      }
    }, false);

    // Set crossorigin and the src of the image,
    img.crossOrigin="anonymous";
    img.src = image_data.images.low_resolution.url;
}




// Function for filling invalidated images slots,
//
// Arguments : instafeed object
// Returns   : Doesn't really return in that sense.
//
function fill_empty_slots(feed){
  // If we still have have available slots call feed.next to get more images,
  logger("in fill empty slots for tag "+feed.options.tagName);
  if (get_slot_from_tag(feed.options.tagName) != "--empty--"){
    var free_slots = g_slots_for_tag[feed.options.tagName].length;
    logger("Still got "+free_slots+" slots for "+feed.options.tagName);
    feed.next();
  }else{
    logger("NO SLOTS LEFT FOR "+feed.options.tagName);
  }
}




// Function wrapper for logging to the console,
//
// Arguments : Text to print,
// Returns   : Doesn't return in that sense.
//
function logger(text){
  if (g_verbose){
    console.log(text);
  }
}
