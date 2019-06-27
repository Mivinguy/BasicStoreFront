// This is the js for the default/index.html view.
var app = function() {

    var self = {};

    Vue.config.silent = false; // show all warnings

    // Extends an array
    self.extend = function(a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };

    // Enumerates an array.
    var enumerate = function(v) { var k=0; return v.map(function(e) {e._idx = k++;});};


    //Hides currently open product reviews
    self.close_review = function(products_idx){
        var p = self.vue.products_list[products_idx];
        p._show_reviews = false;
    }


    //Saves review into database
    self.save_review = function(products_idx){

        var post_index = self.vue.index;
        var sent_content = self.vue.edit_review;
        $.post(add_review_url,
            // Data we are sending.
            {
                index: products_idx,
                post_content: self.vue.edit_review
            },
        );
        console.log("Sent Review");
        self.vue.confirm = true;
        setInterval(
            function () {self.vue.confirm = false},
            1500
        )
    };



    //Gets the list of reviews
    self.get_reviews = function(products_idx, user) {

        //Show current reviews
        var p = self.vue.products_list[products_idx];
        p._show_reviews = true;
        var temp = self.vue.products_list;


        //This hides everything but the current product reviews
        for (var i = 0; i < temp.length; i++) {
            if (temp[i] != p) {
                temp[i]._show_reviews = false;
            }
        }

        $.getJSON(get_reviews_list_url,
            function(data) {
                //
                //  Gets reviews for only the current product
                //
                self.vue.reviews_list = data.reviews_list;
                testing = self.vue.reviews_list;
                for (var i = 0; i < testing.length; i++) {
                    if (testing[i].review_id != products_idx) {
                        testing.splice(i, 1);
                        i--;
                    }
                }
                for (var i = 0; i < testing.length; i++) {
                    if (testing[i].review_email == user) {
                        self.vue.edit_review = testing[i].review_text;
                    }
                }
            }
        );

        //Default text if there wasn't already a prexisting review
        self.vue.edit_review = "Enter your review";

    }


    //For use in other functions
    self.get_user = function(products_idx) {
        $.getJSON(get_user_url,
            function(data) {
                curr_user = data.user;
                if (curr_user != null){
                    curr_user_name = curr_user.first_name + " " + curr_user.last_name;
                    self.get_reviews(products_idx, curr_user_name);
                }
                else{
                    curr_user_name = "None";
                    self.get_reviews(products_idx, curr_user_name);
                }
            }
        );

    }


    //Setting the average star rating
    self.set_avg = function(products_idx, avg) {
        var p = self.vue.products_list[products_idx];
        p.avg_star_display = avg;
        $.post(set_avg_url,
            // Data we are sending.
            {
                product_id: products_idx,
                review_avg: avg
            },
        );
    }


    //Calculates average stars from all reviews
    self.get_average = function(products_idx) {
        var avg
        $.getJSON(get_ratings_list_url,
            function(data) {
            var sum = 0;
            var count = 0;
            self.vue.ratings_list = data.ratings_list;
            var q = self.vue.ratings_list;
            for (var i = 0; i < q.length; i++) {
                if(q[i].product_number == (products_idx + 1)) {
                    //console.log("ID: " + q[i].product_number);
                    sum += q[i].rating
                    count++;
                }
            }
            if(sum == 0){
                avg = 0;
            }
            else{
                avg = sum/count;
            }

            //Calls function to set the star display to the average
            self.set_avg(products_idx, avg)
            }
        );
    }

    //Was for testing
    self.two_events = function(products_idx) {
        self.get_user();
        self.get_reviews(products_idx);
    }



    //Produces the list of products
    self.get_products = function() {
        $.getJSON(get_products_list_url,
            function(data) {
                // I am assuming here that the server gives me a nice list
                // of posts, all ready for display.
                self.vue.products_list = data.products_list;
                // Post-processing.
                self.process_products();
            }
        );
    };

    self.process_products = function() {
        // This function is used to post-process posts, after the list has been modified
        // or after we have gotten new posts.
        // We add the _idx attribute to the posts.
        enumerate(self.vue.products_list);
        // We initialize the smile status to match the like.
        self.vue.products_list.map(function (e) {

            Vue.set(e, '_num_stars_display', e.rating);
            Vue.set(e, 'avg_star_display', e.rating);
            //reviews
            Vue.set(e, '_show_reviews', false);
            Vue.set(e, 'reviews_list', []);
        });
    };


    // Code for star ratings.
    self.stars_out = function (products_idx) {
        // Out of the star rating; set number of visible back to rating.
        var p = self.vue.products_list[products_idx];
        //console.log("product:" + products_idx)
        //console.log("star:" + p.rating)
        p._num_stars_display = p.rating;
    };

    self.stars_over = function(products_idx, star_idx) {
        // Hovering over a star; we show that as the number of active stars.
        var p = self.vue.products_list[products_idx];
        p._num_stars_display = star_idx;
    };

    self.set_stars = function(products_idx, star_idx) {
        // The user has set this as the number of stars for the post.
        var p = self.vue.products_list[products_idx];
        console.log("star:" + star_idx)
        p.rating = star_idx;
        console.log("id:" + (p.id-1))
        // Sends the rating to the server.
        $.post(set_stars_url, {
            products_id: p.id,
            rating: star_idx
        });
    };

    self.inc_desired_quantity = function(products_idx, increment) {
        var p = self.vue.products_list[products_idx];
        if(increment==1){
            p.desired_quantity++
        }
        else {
            p.desired_quantity--
        }
        $.post(update_desired_quan_url, {
            products_id: p.id,
            desired_quantity: p.desired_quantity
        });
    };

     self.goto = function(page) {
         if(page != 'popup' && page != 'prod_from_popup' ){
             self.vue.page = page;
             if(page == 'cart'){
                self.get_cart();
             }
         }
         else if(page == 'prod_from_popup'){
             self.vue.popup = 'false';
             self.vue.page = 'prod';
         }
         else{
             self.vue.popup = 'true';
             self.clear_cart();
         }
    }

    self.buy_product = function(products_idx) {

         var p = self.vue.products_list[products_idx];

         $.post(update_desired_quan_url, {
            products_id: p.id,
            desired_quantity: 0
        });


         $.post(inc_cart_url, {
            products_id: p.id,
            desired_quantity: p.desired_quantity
        });

         p.desired_quantity = 0;

         self.vue.confirm_second = true;
        setInterval(
            function () {self.vue.confirm_second = false},
            1500
        )

         //Reset to 0
    };

     self.get_cart = function() {
         $.getJSON(get_cart_url,
            function(data) {
                var p = self.vue.products_list;

                self.vue.cart_list = data.cart_list;
                var c = self.vue.cart_list;
                var temp_total = 0;
                var each_amount = 0;
                for (var i = 0; i < c.length; i++) {
                    each_amount = (p[(c[i].product_number - 1)].product_price) * c[i].amount;
                    temp_total += each_amount;
                }
                self.vue.total = temp_total;
            }
        );
     }

     self.clear_cart = function() {
        $.post(clear_cart_url, {});
     }

    // Complete as needed.
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            confirm: false,
            confirm_second: false,
            form_title: "",
            form_content: "",
            edit_review: "Enter your review",
            star_average: 0,
            total: 0,
            popup: false,

            //possibly add a review_list here?
            products_list: [],
            reviews_list: [],
            ratings_list: [],
            cart_list: [],
            star_indices: [1, 2, 3, 4, 5],
            page: 'prod'
        },
        methods: {
            add_products: self.add_products,
            // Likers.
            // Star ratings.
            stars_out: self.stars_out,
            stars_over: self.stars_over,
            set_stars: self.set_stars,
            get_reviews: self.get_reviews,
            save_review: self.save_review,
            close_review: self.close_review,
            get_user: self.get_user,
            two_events: self.two_events,
            get_average: self.get_average,
            set_avg: self.set_avg,
            goto: self.goto,
            inc_desired_quantity: self.inc_desired_quantity,
            buy_product: self.buy_product,
        }

    });

    // If we are logged in, shows the form to add posts.
    if (is_logged_in) {
        $("#add_products").show();
    }

    // Gets the posts.
    self.get_products();

    return self;
};

var APP = null;

// No, this would evaluate it too soon.
// var APP = app();

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
