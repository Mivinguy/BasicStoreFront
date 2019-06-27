# Here go your api methods.


@auth.requires_signature()
def get_email():
    email = auth.user.first_name + " " + auth.user.last_name
    # We return the id of the new post, so we can insert it along all the others.
    return response.json(dict(email=email))

@auth.requires_signature()
def add_review():

    reviewer_name = auth.user.first_name + " " + auth.user.last_name
    review_id = db.reviews.update_or_insert(
        (db.reviews.review_email == reviewer_name) & (db.reviews.review_id == request.vars.index),
        review_email=auth.user.first_name + " " + auth.user.last_name,
        review_id=request.vars.index,
        review_text=request.vars.post_content,
    )
    # We return the id of the new post, so we can insert it along all the others.
    return response.json(dict(post_id=review_id))


def get_products_list():
    results = []
    if auth.user is None:
        # Not logged in.
        rows = db().select(db.products.ALL, orderby=db.products.post_time)
        for row in rows:
            results.append(dict(
                id=row.id,
                product_name=row.product_name,
                product_description=row.product_description,
                product_price=row.product_price,
                desired_quantity=row.desired_quantity,
                rating=None,  # As above
            ))
    else:
        # Logged in.
        rows = db().select(db.products.ALL, db.user_star.ALL,
                            left=[
                                db.user_star.on((db.user_star.product_number == db.products.id) & (db.user_star.user_email == auth.user.email)),
                            ],
                            orderby=db.products.post_time)
        for row in rows:
            results.append(dict(
                id=row.products.id,
                product_name=row.products.product_name,
                product_description=row.products.product_description,
                product_price=row.products.product_price,
                desired_quantity=row.products.desired_quantity,
                rating=None if row.user_star.id is None else row.user_star.rating,
            ))
    # For homogeneity, we always return a dictionary.
    return response.json(dict(products_list=results))

def get_reviews_list():
    results = []
    rows = db().select(db.reviews.ALL)
    for row in rows:
        results.append(dict(
            review_id=row.review_id,
            review_email=row.review_email,
            review_text=row.review_text,
            stars=row.stars,
        ))
    return response.json(dict(reviews_list=results))
    


@auth.requires_signature()
def set_stars():
    db.user_star.update_or_insert(
        (db.user_star.product_number == request.vars.products_id) & (db.user_star.user_email == auth.user.email),
        user_email=auth.user.email,
        product_number=request.vars.products_id,
        rating=request.vars.rating
    )

    reviewer_name = auth.user.first_name + " " + auth.user.last_name
    prod_id = int(request.vars.products_id)
    prod_id = prod_id - 1
    db.reviews.update_or_insert(
        (db.reviews.review_email == reviewer_name) & (db.reviews.review_id == prod_id),
        review_email=reviewer_name,
        review_id=prod_id,
        stars=request.vars.rating,
    )

    return "ok"


def update_desired_quan():
    db(db.products.id == request.vars.products_id).update(desired_quantity=request.vars.desired_quantity)
    return "ok"


def clear_cart():
    db.shopping_cart.truncate()
    return "ok"


def get_curr_user():
    if auth.user is None:
        results = None
    else:
        results = auth.user
    return response.json(dict(user=results))


def get_ratings():
    results = []
    rows = db().select(db.user_star.ALL)
    for row in rows:
        results.append(dict(
            user_email=row.user_email,
            product_number=row.product_number,
            rating=row.rating,
        ))
    return response.json(dict(ratings_list=results))


def set_avg():
    product_avg_id = request.vars.product_id
    avg = request.vars.review_avg
    db(db.products.id == product_avg_id).update(avg_stars=avg)

    return "ok"


@auth.requires_signature()
def inc_cart():
    prod_num = request.vars.desired_quantity
    db.shopping_cart.update_or_insert(
        (db.shopping_cart.user_email == auth.user.email) & (db.shopping_cart.product_number == request.vars.products_id),
        user_email=auth.user.email,
        product_number=request.vars.products_id,
        amount=prod_num,
    )


@auth.requires_signature()
def get_cart():
    results = []
    rows = db(db.shopping_cart.user_email == auth.user.email).select()
    for row in rows:
        results.append(dict(
            user_email=row.user_email,
            product_number=row.product_number,
            amount=row.amount,
        ))
    return response.json(dict(cart_list=results))

