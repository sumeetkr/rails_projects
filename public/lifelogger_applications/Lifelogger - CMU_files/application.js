// Place your application-specific JavaScript functions and classes here
// This file is automatically included by javascript_include_tag :defaults
var LFLOG = function () {
    return {
        seg_info_collapse_height: '10px',
        seg_info_expended_height: '80px',
        seg_zoom_level : 1,
        selected_hierarchical_element: null,
        act_seg_tree : null,
        act_seg_trees : new Array(),
        shrink_width : new Array(),
        get_render_width: function(container, start_short, end_short, duration){
            var page_width = container.width() - 15;
            var render_width = (parseFloat(end_short) - parseFloat(start_short)) / parseFloat(duration) * parseFloat(page_width);
            return render_width;
        },
        get_persentage_render_width: function(container, start_short, end_short, duration){
            var page_width = parseFloat(container.width() - 15);
            var vanish_percent = page_width / parseFloat(container.width())
            var render_width = (parseFloat(end_short) - parseFloat(start_short)) / parseFloat(duration) * 100 * vanish_percent;
            return render_width;
        },
        get_persentage_render_width_by_pixel: function(container, pixel_width){
            var page_width = parseFloat(container.width() - 15);
            return parseFloat(pixel_width) / page_width * 100;
        },
        render_boundary_block: function(container, width, css){
            var block = $('<div></div>');
            block.addClass(css);
            var render_width = width;
            //var render_width = LFLOG.get_persentage_render_width_by_pixel(container, width);
            block.css('width', width + 'px');
            //block.css('width', render_width + '%');
            block.attr('_width', render_width);
            container.append(block);
            return block;
        },
        render_block: function(algorithm_id,
                    container,
                    start_short, end_short, duration,
                    color,
                    css_class)
        {
            var shrink_width = LFLOG.shrink_width[algorithm_id];
            
            var block = $('<div></div>');

            // DONOT use pixel!!!
            var render_width = LFLOG.get_render_width(container, start_short, end_short, duration);
            var render_width_floor = Math.floor(render_width);
            if(render_width - render_width_floor > 0.5){
              shrink_width -= (1 - (render_width - render_width_floor));
              render_width = render_width_floor + 1;
            }else{
              shrink_width += (render_width - render_width_floor);
              render_width = render_width_floor;
            }

            if(shrink_width >= 1 || shrink_width <= -1){
              render_width += Math.floor(shrink_width);
              shrink_width = shrink_width - Math.floor(shrink_width);
            }

            //var render_width = LFLOG.get_persentage_render_width(container, start_short, end_short, duration);
            block.addClass(css_class);
            block.css('width', render_width + 'px');
            //block.css('width', render_width + '%');
            block.attr('_width', render_width);
            block.attr('title', LFLOG.formatDate(start_short) + ' ~ ' + LFLOG.formatDate(end_short));
            block.attr('start', start_short);
            block.attr('end', end_short);
            block.attr('color_code', color);
            block.attr('algorithm_id', algorithm_id);
            block.attr('algorithm', algorithm_id);
            if(color != '?null?')
                block.css('background-color', color);
            block.click(LFLOG.hierarchical_seg_on_click);
            container.append(block);

            LFLOG.shrink_width[algorithm_id] = shrink_width;

            return block;
        },
        show_hierachical_detail_by_algorithm: function(e) {
            e.preventDefault();
            var strings = $(this).attr("id").split("_");
            var algorithm_id = 0;
            if(strings.length > 1){
                algorithm_id = strings[0];
            }

            //alert('here');
            var container_id = "#" + algorithm_id + "_hierachical_detail";
            //alert($(link_id).text());
            //alert(algorithm_id);

            if($(this).text() == 'Show Hierarchical Detail'){
                if($(container_id).html() == ''){
                  LFLOG.init_render_seg_trees_by_level(algorithm_id);
                }

                $(container_id).show();
                $(this).text('Hide Hierarchical Detail');
            }else{
                $(container_id).hide();
                $(this).text('Show Hierarchical Detail');
            }
        },
        init_render_seg_trees_by_level: function(algorithm_id) {
            var fileName = '';
            if(algorithm_id != 0){
                fileName = '/act_seg_tree/' + $('#session_id').val() + '_' + algorithm_id + '_seg_tree.json';
            }else{
                fileName = '/act_seg_tree/' + $('#session_id').val() + '_seg_tree.json';
            }

            //alert(fileName);
            if($("#" + algorithm_id + "_seg_trees_container")){
                $("#" + algorithm_id + "_seg_trees_container").empty();

            }
            
            // read the segmentation tree JSON file
            LFLOG.render_seg_trees_by_level(algorithm_id, fileName);
        },
        timeline_sort_remove_overlap_fill_gap: function(timeline) {
            timeline.sort(function(a,b){
                return a.start - b.start;  //Sort by start time
              });

            var last_end = 0;
            var result_time_line = []
            for(var seg_obj_index in timeline){
                var seg_obj = timeline[seg_obj_index];
                var start = seg_obj.start;
                var end = seg_obj.end;
                
                if(last_end == 0){
                    last_end = end;
                }else{
                    if(last_end > start){  // Remove overlap
                        start = last_end;
                        if(start > end){
                            //This seg was removed.
                            continue;
                        }
                    }else if(last_end < start){ // Fill gap
                        var gap_obj = {type: "?null?", start: last_end, end: start, id: -1};
                        result_time_line.push(gap_obj);
                    }
                }

                if(start > end){
                    alert('something goes wrong.');
                }
                var new_seg_obj = {type: seg_obj.type, id: seg_obj.id, start: start, end: end};
                result_time_line.push(new_seg_obj);

                last_end = end;
            }

            return result_time_line;
        },
        render_seg_trees_by_level: function(algorithm_id, fileName) {
            $.getJSON(fileName, function (data) {
                // store the tree in a global variable
                LFLOG.act_seg_trees[algorithm_id] = data;
                LFLOG.shrink_width[algorithm_id] = 0;
                
                var queue = new Array();

                // Use two stacks instead of getting the height of the tree.
                var shiftIndexStack = new Array();
                var shiftNodeStack = new Array();

                var currentLevelNodeCount = 1;  // We have at leat 1 node at the root.
                var levelCount = 0;


                var last_seg_obj = null;
                var render_start = 0;
                var render_end = 0;
                var last_rendered_block = null;
                var seg_container = null;
                
                var go_next_level = true;
                var timeline = [];
                var duration = LFLOG.act_seg_trees[algorithm_id]['seg0']['end_timestamp'] -
                    LFLOG.act_seg_trees[algorithm_id]['seg0']['start_timestamp'];
                var seg_index = 0;

                var processed_node_count = 0;
                var nodes_prcessed_per_iteration = 20;
                var one_pixel_percentage = 0;


                queue.push('seg0');

                var busy = false;
                var processor = setInterval(function() {
                    if(!busy) {
                        
                        busy = true;

                        if(go_next_level){
                            timeline = [];
                            while(currentLevelNodeCount > 0){
                                var child_id = queue.shift();
                                var child = LFLOG.act_seg_trees[algorithm_id][child_id];
                                var new_seg_obj = {
                                        id: child_id,
                                        start: parseInt(child['start_timestamp']),
                                        end: parseInt(child['end_timestamp']),
                                        type: child['color_code']
                                    };
                                timeline.push(new_seg_obj);

                                currentLevelNodeCount--;
                                var sub_segs = child['children'];
                                var childrenCount = sub_segs.length;

                                if(childrenCount == 0 && child_id != 'seg0'){
                                    shiftIndexStack.push(queue.length - currentLevelNodeCount - 1);
                                    shiftNodeStack.push(child_id);
                                }

                                for(var i = 0; i < childrenCount; i++){
                                    queue.push(sub_segs[i]);
                                }
                            }

                            while(shiftIndexStack.length > 0 && queue.length > 0) {
                                var index = shiftIndexStack.pop();
                                var seg_id = shiftNodeStack.pop();
                                queue.splice(index + 1, 0, seg_id);
                            }

                            timeline = LFLOG.timeline_sort_remove_overlap_fill_gap(timeline);
                            seg_container = LFLOG.render_seg_container($("#" + algorithm_id + "_hierachical_detail"),
                                algorithm_id,
                                levelCount
                                );
                            one_pixel_percentage = LFLOG.get_persentage_render_width_by_pixel(seg_container, 1);
                            currentLevelNodeCount = queue.length;
                            levelCount++;
                            go_next_level = false;
                        }else{
                            //Render
                            while(seg_index < timeline.length &&
                                processed_node_count < nodes_prcessed_per_iteration){

                                var seg_obj = timeline[seg_index];
                                var start = seg_obj.start;
                                var end = seg_obj.end;

                                if(start > end){
                                    alert('error, start > end');  //Data validation.
                                }
                                if(last_seg_obj != null){
                                    var floored_render_width = Math.floor(
                                        LFLOG.get_render_width(seg_container, render_start, render_end, duration));
                                    /*var floored_render_width = Math.floor(
                                        LFLOG.get_persentage_render_width(seg_container, render_start, render_end, duration));*/
                                    if(last_seg_obj.type == seg_obj.type && floored_render_width < 3 /** one_pixel_percentage*/){
                                        // Small fragment, go ahead.
                                        render_end = end;
                                    }else if(last_seg_obj.type == seg_obj.type && floored_render_width >= 3 /** one_pixel_percentage*/){
                                        // Large enough to draw a boundary
                                        
                                        last_rendered_block =
                                            LFLOG.render_block(algorithm_id,
                                                seg_container,
                                                render_start, render_end,
                                                duration,
                                                last_seg_obj.type,
                                                'hierachical_segment'
                                            );
                                        

                                        // Since we've drawn a boundary with width = 1, the seg width should minus 1.
                                        var block_width = last_rendered_block.attr('_width');
                                        var subtract_width = 1;
                                        last_rendered_block.css('width', (block_width - subtract_width) + 'px');

                                        //var subtract_width = LFLOG.get_persentage_render_width_by_pixel(seg_container, 1);
                                        //last_rendered_block.css('width', (block_width - subtract_width) + '%');
                                        
                                        last_rendered_block.attr('_width', block_width - subtract_width);
                                        LFLOG.render_boundary_block(seg_container, 1, 'hierachical_segment');

                                        render_start = start;
                                        render_end = end;

                                        processed_node_count += 2;
                                    }else{
                                        //Render the last block.
                                        last_rendered_block = 
                                            LFLOG.render_block(algorithm_id,
                                                seg_container,
                                                render_start, render_end,
                                                duration,
                                                last_seg_obj.type,
                                                'hierachical_segment'
                                            );

                                        render_start = start;
                                        render_end = end;

                                        processed_node_count++;
                                    }
                                }else{
                                    render_start = start;
                                    render_end = end;
                                }
                                
                                last_seg_obj = seg_obj;
                                seg_index++;
                                
                            }

                            if(processed_node_count >= nodes_prcessed_per_iteration){
                                //Processed enough div, let the browser take a rest.
                                processed_node_count = 0;
                            }

                            if(seg_index == timeline.length){
                                // We finished rendering this level.

                                // Render the last seg of this time line.
                                last_rendered_block = LFLOG.render_block(algorithm_id,
                                    seg_container,
                                    render_start, render_end,
                                    duration,
                                    last_seg_obj.type,
                                    'hierachical_segment');

                                
                                // Do the last width fix.
                                var last_width = parseFloat(last_rendered_block.attr('_width'));
                                last_width += LFLOG.shrink_width[algorithm_id];
                                last_rendered_block.css('width', last_width + 'px');
                                
                                
                                // Reset all params.
                                LFLOG.shrink_width[algorithm_id] = 0;
                                processed_node_count = 0;
                                seg_index = 0;
                                go_next_level = true;
                                last_seg_obj = null;
                                render_start = 0;
                                render_end = 0;
                                last_rendered_block = null;
                                seg_container = null;

                                if(queue.length == 0){
                                    clearInterval(processor);
                                }
                            }
                        }

                        busy = false;
                    }
                }, 100);

            })
        },
        render_seg_container: function(container, algorithm_id, level_id){
            var seg_container = $('<div></div>');
            seg_container.attr('id', "level_" + level_id + "_algorithm_" + algorithm_id);

            seg_container.attr('algorithm', algorithm_id);
            seg_container.attr('level', level_id);

            seg_container.attr('class', 'hierachical_main_segment');

            container.append(seg_container);
            //seg_container.css('width', '100%');

            //var width_in_pixel = seg_container.width();
            
            //seg_container.css('width', width_in_pixel + 'px');
            
            return seg_container;
        },
        hierarchical_seg_on_click: function(e) {
            //alert('here');
            e.preventDefault();
            if(LFLOG.select_hierarchical_element != null){
                LFLOG.select_hierarchical_element.css('border', 'none');
                //LFLOG.select_hierarchical_element.css('height', $('.hierachical_segment').height());
            }

            var borderColor = LFLOG.get_reverse_color($(this).attr('color_code'));
                
            LFLOG.select_hierarchical_element = $(this);
            $(this).css('border', borderColor + ' 2px solid');
            //$(this).css('height', '32px');
            reloadSensorData($(this).attr('start'), $(this).attr('end'));

        },
        convert_byte_to_hex_color_code: function(decimal) {
            var hex = parseInt(decimal).toString(16);
            if(hex.toString().length == 1)
                return '0' + hex.toString();
            if(hex.toString().length == 0)
                return '00';
            return hex.toString();
        },
        get_reverse_color: function(color_code) {

            //alert(color_code);
            var color_value = parseInt(color_code.substr(1, color_code.length - 1), 16);
            var red = (color_value & 0x00ff0000) >> 16;
            var green = (color_value & 0x0000ff00) >> 8;
            var blue = color_value & 0x000000ff;
            var reverseColor = LFLOG.convert_byte_to_hex_color_code(255 - red) +
                LFLOG.convert_byte_to_hex_color_code(255 - green) +
                LFLOG.convert_byte_to_hex_color_code(255 - blue);

            //alert('#' + reverseColor.toString(16));
            return '#' + reverseColor;
            
        },
        reset_hierarchical_seg_selection: function(e) {
            e.preventDefault();
            //alert('reset');
            if(LFLOG.select_hierarchical_element != null){
                LFLOG.select_hierarchical_element.css('border', 'none');
            }
        },
        init_seg_timeline_by_algorithm: function(algorithm_id) {
            //alert('init_seg_timeline_by_algorithm');
            var fileName = '/act_seg_tree/' + $('#session_id').val() + '_' + algorithm_id + '_seg_tree.json';
            //alert(fileName);
            if($("#" + algorithm_id + "_seg0")){
                $("#" + algorithm_id + "_seg0").empty();
                
            }
            // read the segmentation tree JSON file
            $.getJSON(fileName, function (data) {
                // store the tree in a global variable
                //alert('load completed.');
                LFLOG.act_seg_trees[algorithm_id] = data;

                // initialize the segmentation timeline based on the root segment i.e. seg0
                //alert(LFLOG.act_seg_trees[algorithm_id]['seg0']['start_timestamp']);
                //$('.seg_info a').click(LFLOG.zoom_out_segment);

                $('#' + algorithm_id + '_reset_seg_timeline').click(LFLOG.reset_seg_timeline_by_algorithm);
                $('#' + algorithm_id + '_expand_seg_timeline').click(LFLOG.show_hierachical_detail_by_algorithm);
                LFLOG.render_seg_in_place_by_algorithm('seg0', $('#' + algorithm_id + '_seg0'), algorithm_id);
            })
        },
        reset_seg_timeline_by_algorithm : function (e) {
            //alert('reset_seg_timeline_by_algorithm');
            e.preventDefault();
            var strings = $(this).attr("id").split("_");
            var algorithm_id = 0;
            if(strings.length > 1){
                algorithm_id = strings[0];
            }

            //alert(algorithm_id);
            $('#' + algorithm_id + '_seg0').fadeOut('fast');
            $('#' + algorithm_id + '_seg0').empty();
            LFLOG.render_seg_in_place_by_algorithm('seg0', $('#' + algorithm_id + '_seg0'), algorithm_id);
            $('#' + algorithm_id + '_seg0').fadeIn('slow');

            $('#' + algorithm_id + '_clear').height(LFLOG.seg_info_collapse_height);
            
            // reset the timeline control with the original start / end times
            reloadSensorData($('#original_start_time').val(), $('#original_end_time').val());
        },
        render_seg_in_place_by_algorithm : function (seg_id, seg_element, algorithm_id) {
            //alert('render_seg_in_place_by_algorithm');
            //alert("seg_id = " + seg_id);
            var mseg_start_time = parseInt(LFLOG.act_seg_trees[algorithm_id][seg_id]['start_timestamp']);
            var mseg_end_time = parseInt(LFLOG.act_seg_trees[algorithm_id][seg_id]['end_timestamp']);
            $('#' + algorithm_id + '_seg_time_slot').val(LFLOG.formatDate(mseg_start_time) + ' ~ ' + LFLOG.formatDate(mseg_end_time));
            var duration = mseg_end_time - mseg_start_time;
            var sub_segs = LFLOG.act_seg_trees[algorithm_id][seg_id]['children'];
            var seg_parent = LFLOG.act_seg_trees[algorithm_id][seg_id]['parent'];
            var main_seg = seg_element;
            var main_seg_width = main_seg.width() - 15;
            var main_seg_type = main_seg.attr('class');
            var sub_segment_type = 'segment_' + (parseInt(main_seg_type.charAt(main_seg_type.length - 1)));

            // unregister the click event for the main segment
            main_seg.unbind('click');

            // load the main segment
            main_seg.attr('seg_parent', seg_parent);
            main_seg.attr('algorithm_id', algorithm_id);
            
            //alert("sub_segs.lenth = " + sub_segs.length);
            var start = 0;
            var end = 0;
            
            if (sub_segs.length > 0) {
                var busy = false;
                var i = 0;
                var processor = setInterval(function() {
                    if(!busy) {

                        busy = true;
                //for (var i = 0; i < sub_segs.length; i++) {
                        var sub_seg_id = sub_segs[i];

                        if(i == 0){
                            start = parseInt(LFLOG.act_seg_trees[algorithm_id][sub_seg_id]['start_timestamp']);
                            end = parseInt(LFLOG.act_seg_trees[algorithm_id][sub_seg_id]['end_timestamp']);

                        }else{
                            start = end;
                            end = Math.max(end, parseInt(LFLOG.act_seg_trees[algorithm_id][sub_seg_id]['end_timestamp']));
                        }

                        if(start < end || i == sub_segs.length - 1){
                            var elmt_width = (main_seg_width * (end - start) / duration);
                            var floor = Math.floor(elmt_width);
                            if(elmt_width - floor > 0.5)
                                elmt_width = floor + 1;
                            else
                                elmt_width = floor;
                            //var elmt_width = Math.floor(main_seg_width * (end - start) / duration) + 'px';

                            // create a div element representing the sub-segment
                            var seg_elmt = $('<div></div>');
                            seg_elmt.attr('id', algorithm_id + '_' + sub_seg_id);
                            seg_elmt.attr('algorithm_id', algorithm_id);
                            seg_elmt.attr('title', LFLOG.formatDate(start) + ' ~ ' + LFLOG.formatDate(end));
                            seg_elmt.addClass(sub_segment_type);
                            seg_elmt.css('width', elmt_width + 'px');
                            seg_elmt.css('background-color', LFLOG.act_seg_trees[algorithm_id][sub_seg_id]['color_code']);
                            main_seg.append(seg_elmt);

                            //alert(elmt_width);
                            $('.' + sub_segment_type).click(LFLOG.zoom_in_segment_by_algorithm);
                            $('.' + sub_segment_type).tooltip();
                        }

                        i++;

                        if(i == sub_segs.length){
                            clearInterval(processor);
                        }
                        
                        busy = false;
                //}
                    }
                },100);

                
            } else {
                //main_seg.html('<div class="main_segment_1" title="No sub-segments available!" />');
                main_seg.css('background-color', LFLOG.act_seg_trees[algorithm_id][seg_id]['color_code']);
                
                if ($('#tooltip')) {
                    $('#tooltip').hide();
                }
                //alert('No sub-segments available!');
            }
        },
        zoom_in_segment_by_algorithm : function (e) {
            //alert('zoom_in_segment_by_algorithm');
            var seg_id = $(this).attr('id');
            var strings = seg_id.split("_");
            var algorithm_id = 0;
            if(strings.length > 1){
                algorithm_id = strings[0];
            }
            /*
            var placementTagElement = $('<div></div>');
            placementTagElement.addClass('placement_tag');
            placementTagElement.css('height', LFLOG.seg_info_expended_height);
            $('#' + algorithm_id + '_clear').append(placementTagElement);
            */
            if($('#' + algorithm_id + '_clear').css('height') != LFLOG.seg_info_expended_height){
                $('#' + algorithm_id + '_clear').css('height', LFLOG.seg_info_expended_height);
            }
            
            var original_segment_type = $(this).attr('class');
            var new_segment_type = 'main_segment_' + (parseInt(original_segment_type.charAt(original_segment_type.length - 1)) + 1);

            // remove any segment with the new segment type
            $.each($('.' + new_segment_type), function(i, v) {
               var element = $(v);
               if($(v).attr('algorithm_id') == algorithm_id) {
                   element.empty();
                   element.removeClass(new_segment_type).addClass(original_segment_type);
                   element.width(element.attr('original_width') + 'px');
               }
            });

            // restore orignal width for each segment
            $.each($('.' + original_segment_type), function(i, v) {
               var element = $(v);
               if($(v).attr('algorithm_id') == algorithm_id) {
                   if (element.attr('original_width') != null) {
                       element.width(element.attr('original_width') + 'px');
                   }
                   element.click(LFLOG.zoom_in_segment_by_algorithm);
               }
            });

            // make the selected semgnet a main segment
            var original_segment_width = $(this).width();
            $(this).fadeOut('fast');
            $(this).attr('original_width', original_segment_width);
            $(this).width(''); // remove the width style so that the width defined in the class will be in effect
            $(this).removeClass(original_segment_type).addClass(new_segment_type);
            
            // shrink the width of the selected segment's siblings
            var parent_seg_width = $('#' + algorithm_id + '_' + LFLOG.act_seg_trees[algorithm_id][strings[1]]['parent']).width();
            var shrink_ratio = (parent_seg_width - $(this).width()) / parent_seg_width;

            // Since we had multiple algorithms, we need to identify which seg is the actual siblings.
            var segs_with_same_class = $('.' + original_segment_type);
            var sibling_segs = new Array();

            $.each(segs_with_same_class, function(i, v) {
                if($(v).attr('algorithm_id') == algorithm_id){
                    sibling_segs.push($(v));
                }
            });
            
            var additional_width = original_segment_width * shrink_ratio / sibling_segs.length;

            for(i = 0; i < sibling_segs.length; i++){
                sibling_segs[i].attr('original_width', sibling_segs[i].width());
                sibling_segs[i].width(sibling_segs[i].width() * shrink_ratio + additional_width);
            }
            
            LFLOG.render_seg_in_place_by_algorithm(strings[1], $(this), algorithm_id);
            
            $(this).fadeIn('slow');
            //LFLOG.seg_zoom_level += 1;
            //$('#seg_zoom_level').html('Zoom Level: ' + LFLOG.seg_zoom_level);
            //alert("zoom level " + LFLOG.seg_zoom_level);
            // reload sensor data
            var start_time = LFLOG.act_seg_trees[algorithm_id][strings[1]]['start_timestamp'];
            var end_time = LFLOG.act_seg_trees[algorithm_id][strings[1]]['end_timestamp'];
            reloadSensorData(start_time, end_time);
        },
        /*zoom_out_segment_by_algorithm : function (e) {
            e.preventDefault();

            var seg_id = $('#main_seg').attr('seg_parent');
            alert(seg_id);
            var strings = seg_id.split("_");
            var algorithm_id = 0;
            if(strings.length > 0){
                algorithm_id = strings[0];
            }
            
            if (seg_id != 'null') {
                alert(strings[1]);
                
                LFLOG.render_seg_in_place_by_algorithm(strings[1], $('#' + seg_id), algorithm_id);
                LFLOG.seg_zoom_level -= 1;
                $('#seg_zoom_level').html('Zoom Level: ' + LFLOG.seg_zoom_level);

                // reload sensor data
                var start_time = LFLOG.act_seg_trees[algorithm_id][strings[1]]['start_timestamp'];
                var end_time = LFLOG.act_seg_trees[algorithm_id][strings[1]]['end_timestamp'];
                reloadSensorData(start_time, end_time);
            } else {
                alert("You're already at the top zoom level!");
            }
        },*/
        init_seg_timeline : function () {
            //alert('init_seg_timeline');
            var fileName = fileName = '/act_seg_tree/' + $('#session_id').val() + '_seg_tree.json';

            $('#seg_timeline').height('100px');

            //alert(fileName);
            if($("#seg0")){
                $("#seg0").empty();
            }
            
            // read the segmentation tree JSON file
            $.getJSON(fileName, function (data) {
                // store the tree in a global variable
                LFLOG.act_seg_tree = data;
                
                // initialize the segmentation timeline based on the root segment i.e. seg0
                //alert(LFLOG.act_seg_tree['seg0']['start_timestamp']);
                //$('.seg_info a').click(LFLOG.zoom_out_segment);
                //LFLOG.render_seg('seg0');
                $('#reset_seg_timeline').click(LFLOG.reset_seg_timeline);
                $('#0_expand_seg_timeline').click(LFLOG.show_hierachical_detail_by_algorithm);
                LFLOG.render_seg_in_place('seg0', $('#seg0'));
            })
        },
        
        reset_seg_timeline : function (e) {
            //alert('reset_seg_timeline');
            e.preventDefault();

            $('#0_clear').height(LFLOG.seg_info_collapse_height);
            $('#seg0').fadeOut('fast');
            $('#seg0').empty();
            LFLOG.render_seg_in_place('seg0', $('#seg0'));
            $('#seg0').fadeIn('slow');

            // reset the timeline control with the original start / end times
            reloadSensorData($('#original_start_time').val(), $('#original_end_time').val());
        },
        render_seg : function (seg_id) { // deprecated, use render_seg_in_place instead
            //alert('render_seg');
            var mseg_start_time = parseInt(LFLOG.act_seg_tree[seg_id]['start_timestamp']);
            $('#seg_start_time').html(LFLOG.formatDate(mseg_start_time));
            var mseg_end_time = parseInt(LFLOG.act_seg_tree[seg_id]['end_timestamp']);
            $('#seg_end_time').html(LFLOG.formatDate(mseg_end_time));
            var duration = mseg_end_time - mseg_start_time;
            var sub_segs = LFLOG.act_seg_tree[seg_id]['children'];
            var seg_parent = LFLOG.act_seg_tree[seg_id]['parent'];
            var main_seg = $('#seg0');
            var seg_class = 'segment_' + LFLOG.seg_zoom_level;

            // reset the selected segment
            main_seg.fadeOut('fast').css('background-color', LFLOG.act_seg_tree[seg_id]['color_code']).fadeIn('slow');
            main_seg.empty();
            main_seg.attr('seg_parent', seg_parent);

            if (sub_segs.length > 0) {
                for (var i = 0; i < sub_segs.length; i++) {
                    var sub_seg_id = sub_segs[i];
                    var start = parseInt(LFLOG.act_seg_tree[sub_seg_id]['start_timestamp']);
                    var end = parseInt(LFLOG.act_seg_tree[sub_seg_id]['end_timestamp']);
                    var elmt_width = (1000 * (end - start) / duration) + 'px';
                    //var elmt_width = Math.floor(1000 * (end - start) / duration) + 'px';

                    // create a div element representing the sub-segment
                    var seg_elmt = $('<div></div>');                    
                    seg_elmt.attr('id', sub_seg_id);
                    seg_elmt.attr('title', LFLOG.formatDate(start) + ' ~ ' + LFLOG.formatDate(end));
                    seg_elmt.addClass(seg_class);
                    seg_elmt.css('width', elmt_width);
                    seg_elmt.css('background-color', LFLOG.act_seg_tree[sub_seg_id]['color_code']);
                    main_seg.append(seg_elmt);
                }
                
                $('.' + seg_class).click(LFLOG.zoom_in_segment);
                $('.' + seg_class).tooltip();
            } else {
                main_seg.css('text-align', 'center');
                main_seg.html('<b style="font-size:30px">No sub-segments available!</b>');
                if ($('#tooltip')) {
                    $('#tooltip').hide();
                }
            }
        },
        render_seg_in_place : function (seg_id, seg_element) {
            //alert('render_seg_in_place');
            //alert("seg_id = " + seg_id);
            var mseg_start_time = parseInt(LFLOG.act_seg_tree[seg_id]['start_timestamp']);
            var mseg_end_time = parseInt(LFLOG.act_seg_tree[seg_id]['end_timestamp']);
            $('#seg_time_slot').val(LFLOG.formatDate(mseg_start_time) + ' ~ ' + LFLOG.formatDate(mseg_end_time));
            var duration = mseg_end_time - mseg_start_time;
            var sub_segs = LFLOG.act_seg_tree[seg_id]['children'];
            var seg_parent = LFLOG.act_seg_tree[seg_id]['parent'];
            var main_seg = seg_element;
            var main_seg_width = main_seg.width() - 15;
            var main_seg_type = main_seg.attr('class');
            var sub_segment_type = 'segment_' + (parseInt(main_seg_type.charAt(main_seg_type.length - 1)));

            // unregister the click event for the main segment
            main_seg.unbind('click');


            // load the main segment
            main_seg.attr('seg_parent', seg_parent);
            //alert("sub_segs.lenth = " + sub_segs.length);
            if (sub_segs.length > 0) {
                for (var i = 0; i < sub_segs.length; i++) {
                    var sub_seg_id = sub_segs[i];
                    var start = parseInt(LFLOG.act_seg_tree[sub_seg_id]['start_timestamp']);
                    var end = parseInt(LFLOG.act_seg_tree[sub_seg_id]['end_timestamp']);
                    var elmt_width = (main_seg_width * (end - start) / duration) + 'px';
                    //var elmt_width = Math.floor(main_seg_width * (end - start) / duration) + 'px';

                    // create a div element representing the sub-segment
                    var seg_elmt = $('<div></div>');
                    seg_elmt.attr('id', sub_seg_id);
                    seg_elmt.attr('algorithm_id', '0');
                    seg_elmt.attr('title', LFLOG.formatDate(start) + ' ~ ' + LFLOG.formatDate(end));
                    seg_elmt.addClass(sub_segment_type);
                    seg_elmt.css('width', elmt_width);
                    seg_elmt.css('background-color', LFLOG.act_seg_tree[sub_seg_id]['color_code']);
                    main_seg.append(seg_elmt);
                    //alert(elmt_width);
                }

                $('.' + sub_segment_type).click(LFLOG.zoom_in_segment);
                $('.' + sub_segment_type).tooltip();
            } else {
                //main_seg.html('<img style="height:inherit;width:inherit;" src="/images/Empty-Set-Black.png" title="No sub-segments available!" />');
                if ($('#tooltip')) {
                    $('#tooltip').hide();
                }
                //alert('No sub-segments available!');
            }
        },
        zoom_in_segment : function (e) {
            //alert('zoom_in_segment');
            var seg_id = $(this).attr('id');
            var original_segment_type = $(this).attr('class');
            var new_segment_type = 'main_segment_' + (parseInt(original_segment_type.charAt(original_segment_type.length - 1)) + 1);


            if($('#0_clear').height() != LFLOG.seg_info_expended_height){
                $('#0_clear').height(LFLOG.seg_info_expended_height);
            }
            
            // remove any segment with the new segment type
            $.each($('.' + new_segment_type), function(i, v) {
               var element = $(v);
               if(element.attr('algorithm_id') == '0') {
                   element.empty();
                   element.removeClass(new_segment_type).addClass(original_segment_type);
                   element.width(element.attr('original_width') + 'px');
               }
            });

            // restore orignal width for each segment
            $.each($('.' + original_segment_type), function(i, v) {
               var element = $(v);
               if(element.attr('algorithm_id') == '0') {
                   if (element.attr('original_width') != null) {
                       element.width(element.attr('original_width') + 'px');
                   }
                   element.click(LFLOG.zoom_in_segment);
               }
            });

            // make the selected semgnet a main segment
            var original_segment_width = $(this).width();
            $(this).fadeOut('fast');
            $(this).attr('original_width', original_segment_width);
            $(this).width(''); // remove the width style so that the width defined in the class will be in effect
            $(this).removeClass(original_segment_type).addClass(new_segment_type);

            // shrink the width of the selected segment's siblings
            var parent_seg_width = $('#' + LFLOG.act_seg_tree[seg_id]['parent']).width();
            var shrink_ratio = (parent_seg_width - $(this).width()) / parent_seg_width;
            var segs_with_same_class = $('.' + original_segment_type);
            var sibling_segs = new Array();

            $.each(segs_with_same_class, function(i, v) {
                if($(v).attr('algorithm_id') == '0'){
                    sibling_segs.push($(v));
                }
            });
            
            var additional_width = original_segment_width * shrink_ratio / sibling_segs.length;
            $.each(sibling_segs, function(i, v) {
                var element = $(v);
                if($(v).attr('algorithm_id') == '0') {
                    element.attr('original_width', element.width());
                    element.width(element.width() * shrink_ratio + additional_width);
                }
            });

            //alert(original_segment_width);
            LFLOG.render_seg_in_place(seg_id, $(this));
            $(this).fadeIn('slow');
            //LFLOG.seg_zoom_level += 1;
            //$('#seg_zoom_level').html('Zoom Level: ' + LFLOG.seg_zoom_level);
            //alert("zoom level " + LFLOG.seg_zoom_level);
            // reload sensor data
            var start_time = LFLOG.act_seg_tree[seg_id]['start_timestamp'];
            var end_time = LFLOG.act_seg_tree[seg_id]['end_timestamp'];
            reloadSensorData(start_time, end_time);
        },
        /*zoom_out_segment : function (e) {
            e.preventDefault();
            var seg_id = $('#main_seg').attr('seg_parent');
            if (seg_id != 'null') {
                LFLOG.render_seg(seg_id);
                LFLOG.seg_zoom_level -= 1;
                $('#seg_zoom_level').html('Zoom Level: ' + LFLOG.seg_zoom_level);

                // reload sensor data
                var start_time = LFLOG.act_seg_tree[seg_id]['start_timestamp'];
                var end_time = LFLOG.act_seg_tree[seg_id]['end_timestamp'];
                reloadSensorData(start_time, end_time);
            } else {
                alert("You're already at the top zoom level!");
            }
        },*/
        generate_hex_color_code : function () {
            // 0xFFFFFF == 16777215
            return '#' + Math.floor((Math.random() * 16777215)).toString(16);
        },
        formatDate : function (seconds) {
            var date = new Date(seconds * 1000); // change the unit of the timestamp to millisecond
            return date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate() + ' ' +
                   date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
        }
    }
} ();
