'use strict';
/**
 * Kado - Module system for Enterprise Grade applications.
 * Copyright © 2015-2018 NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado.
 *
 * Kado is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Kado is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Kado.  If not, see <https://www.gnu.org/licenses/>.
 */
const K = require('kado')
const sequelize = K.db.sequelize

const Doc = sequelize.models.Doc


/**
 * List
 * @param {object} req
 * @param {object} res
 */
exports.list = (req,res) => {
  if(!req.query.length){
    res.render(res.locals._view.get('doc/list'))
  } else {
    K.datatable(Doc,req.query)
      .then((result) => {
        res.json(result)
      })
      .catch((err) => {
        res.json({error: err.message})
      })
  }
}


/**
 * Create entry
 * @param {object} req
 * @param {object} res
 */
exports.create = (req,res) => {
  res.render(res.locals._view.get('doc/create'))
}


/**
 * Edit
 * @param {object} req
 * @param {object} res
 */
exports.edit = (req,res) => {
  Doc.find({where: {id: req.query.id}})
    .then((result) => {
      if(!result) throw new Error(K._l.doc.entry_not_found)
      res.render(res.locals._view.get('doc/edit'),{item: result})
    })
    .catch((err) => {
      res.render('error',{error: err})
    })
}


/**
 * Save
 * @param {object} req
 * @param {object} res
 */
exports.save = (req,res) => {
  let data = req.body
  let isNew = false
  let json = K.isClientJSON(req)
  Doc.findOne({where: {id: data.id}})
    .then((result) => {
      if(!result){
        isNew = true
        result = Doc.build()
      }
      if(data.title) result.title = data.title
      if(data.uri) result.uri = data.uri
      if('undefined' === typeof data.active) result.active = false
      if(data.active) result.active = true
      return result.save()
    })
    .then((result) => {
      if(json){
        res.json({item: result.dataValues})
      } else {
        req.flash('success',{
          message: K._l.doc.entry + ' ' + (isNew ? K._l.created : K._l.saved),
          href: '/doc/edit?id=' + result.id,
          name: result.id
        })
        res.redirect('/doc/list')
      }
    })
    .catch((err) => {
      res.render('error',{error: err})
    })
}


/**
 * Process removals
 * @param {object} req
 * @param {object} res
 */
exports.remove = (req,res) => {
  let json = K.isClientJSON(req)
  if(req.query.id) req.body.remove = req.query.id.split(',')
  if(!(req.body.remove instanceof Array)) req.body.remove = [req.body.remove]
  K.modelRemoveById(Doc,req.body.remove)
    .then(() => {
      if(json){
        res.json({success: K._l.doc.entry_removed})
      } else {
        req.flash('success',K._l.doc.entry_removed)
        res.redirect('/doc/list')
      }
    })
    .catch((err) => {
      if(json){
        res.json({error: err.message || K._l.doc.removal_error})
      } else {
        res.render(res.locals._view.get('error'),{error: err.message})
      }
    })
}
