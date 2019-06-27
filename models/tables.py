# Define your tables below (or better in another model file) for example
#
# >>> db.define_table('mytable', Field('myfield', 'string'))
#
# Fields can be 'string','text','password','integer','double','boolean'
#       'date','time','datetime','blob','upload', 'reference TABLENAME'
# There is an implicit 'id integer autoincrement' field
# Consult manual for more options, validators, etc.




# after defining tables, uncomment below to enable auditing
# auth.enable_record_versioning(db)


import datetime

def get_user_email():
    return None if auth.user is None else auth.user.email

def get_user_name():
    return None if auth.user is None else auth.user.first_name

def get_current_time():
    return datetime.datetime.utcnow()


db.define_table('products',
                Field('product_name'),
                Field('product_description'),
                Field('product_price', 'float'),
                Field('desired_quantity', 'integer', default=0),
                Field('post_time', 'datetime', default=get_current_time()),
                Field('avg_stars')
                )

db.define_table('reviews',
                Field('review_email', default=get_user_name()),
                Field('review_id'),
                Field('review_text'),
                Field('stars')
                )

db.define_table('user_star',
                Field('user_email', default=get_user_email()),
                Field('product_number'),
                Field('rating', 'integer', default=None),
                )

db.define_table('shopping_cart',
                Field('user_email', default=get_user_email()),
                Field('product_number', 'reference products'),
                Field('amount', 'integer'),
                )

