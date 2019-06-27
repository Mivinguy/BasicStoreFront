# -*- coding: utf-8 -*-
# this file is released under public domain and you can use without limitations

# -------------------------------------------------------------------------
# This is a sample controller
# - index is the default action of any application
# - user is required for authentication and authorization
# - download is for downloading files uploaded in the db (does streaming)
# -------------------------------------------------------------------------
import json
import os
import traceback

def index():
    # We just want to expand the template.
    return dict()


def products():
    db.products.id.readable = False
    db.products.avg_stars.readable = False
    db.products.avg_stars.writable = False
    db.products.post_time.readable = False
    db.products.post_time.writable = False
    grid = SQLFORM.grid(db.products,
                        create=True, editable=True,
                        )
    return dict(grid=grid)


def reviews():
    grid = SQLFORM.grid(db.shopping_cart,
                        create=True, editable=True,
                        )
    return dict(grid=grid)

def stars():
    grid = SQLFORM.grid(db.user_star,
                        create=True, editable=True,
                        )
    return dict(grid=grid)


def user():
    """
    exposes:
    http://..../[app]/default/user/login
    http://..../[app]/default/user/logout
    http://..../[app]/default/user/register
    http://..../[app]/default/user/profile
    http://..../[app]/default/user/retrieve_password
    http://..../[app]/default/user/change_password
    http://..../[app]/default/user/bulk_register
    use @auth.requires_login()
        @auth.requires_membership('group name')
        @auth.requires_permission('read','table name',record_id)
    to decorate functions that need access control
    also notice there is http://..../[app]/appadmin/manage/auth to allow administrator to manage users
    """
    return dict(form=auth())


@cache.action()
def download():
    """
    allows downloading of uploaded files
    http://..../[app]/default/download/[filename]
    """
    return response.download(request, db)


def call():
    """
    exposes services. for example:
    http://..../[app]/default/call/jsonrpc
    decorate with @services.jsonrpc the functions to expose
    supports xml, json, xmlrpc, jsonrpc, amfrpc, rss, csv
    """
    return service()


