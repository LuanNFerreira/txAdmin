//Requires
const { dir, log, logOk, logWarn, logError, cleanTerminal } = require('../extras/console');
const webUtils = require('./webUtils.js');
const context = 'WebServer:adminManagerActions';

//Helper functions
const isUndefined = (x) => { return (typeof x === 'undefined') };

/**
 * Returns the output page containing the admins.
 * @param {object} res
 * @param {object} req
 */
module.exports = async function action(res, req) {
    //Sanity check
    if(isUndefined(req.params.action)){
        res.status(400);
        res.send({status: 'error', error: "Invalid Request"});
        return;
    }
    let action = req.params.action;

    //Delegate to the specific scope functions
    if(action == 'add'){
        return handleAdd(res, req);
    }else if(action == 'edit'){
        return handleEdit(res, req);
    }else if(action == 'delete'){
        return handleDelete(res, req);
    }else if(action == 'getModal'){
        return await handleGetModal(res, req);
    }else{
        return res.send({
            type: 'danger',
            message: 'Unknown action.'
        });
    }
};


//================================================================
/**
 * Handle Add
 * @param {object} res 
 * @param {object} req 
 */
function handleAdd(res, req) {
    //Sanity check
    if(
        isUndefined(req.body.name) ||
        typeof req.body.name !== 'string' ||
        isUndefined(req.body.password) ||
        typeof req.body.password !== 'string' ||
        isUndefined(req.body.permissions)
    ){
        res.status(400);
        return res.send({type: 'danger', message: "Invalid Request - missing parameters"});
    }

    //Prepare and filter variables
    let name = req.body.name.trim();
    let password = req.body.password.trim();
    let permissions = (Array.isArray(req.body.permissions))? req.body.permissions : [];
    permissions = permissions.filter((x)=>{ return typeof x === 'string'});
    if(permissions.includes('all')) permissions = ['all'];

    //Validate fields
    if(!/^[a-zA-Z0-9]{6,16}$/.test(name)){
        return res.send({type: 'danger', message: "Invalid username"});
    }
    if(password.length < 6){
        return res.send({type: 'danger', message: "Invalid password"});
    }

    //Add admin and give output
    try {
        globals.authenticator.addAdmin(name, password, permissions);
        return res.send({type: 'success', message: `refresh`});
    } catch (error) {
        return res.send({type: 'danger', message: error.message});
    }
}


//================================================================
/**
 * Handle Edit
 * @param {object} res 
 * @param {object} req 
 */
function handleEdit(res, req) {
    //Sanity check
    if(
        isUndefined(req.body.name) ||
        typeof req.body.name !== 'string' ||
        isUndefined(req.body.password) ||
        typeof req.body.password !== 'string' ||
        isUndefined(req.body.permissions)
    ){
        res.status(400);
        return res.send({type: 'danger', message: "Invalid Request - missing parameters"});
    }

    //Prepare and filter variables
    let name = req.body.name.trim();
    let password = req.body.password.trim();
    password = (password.length)? password : false;
    let permissions = (Array.isArray(req.body.permissions))? req.body.permissions : [];
    permissions = permissions.filter((x)=>{ return typeof x === 'string'});
    if(permissions.includes('all')) permissions = ['all'];

    //Validate fields
    if(password && password.length < 6){
        return res.send({type: 'danger', message: "Invalid password"});
    }

    //Add admin and give output
    try {
        globals.authenticator.editAdmin(name, password, permissions);
        return res.send({type: 'success', message: `refresh`});
    } catch (error) {
        return res.send({type: 'danger', message: error.message});
    }
}


//================================================================
/**
 * Handle Delete
 * @param {object} res 
 * @param {object} req 
 */
function handleDelete(res, req) {
    //Sanity check
    if(isUndefined(req.body.serverName)){
        res.status(400);
        return res.send({type: 'danger', message: "Invalid Request - missing parameters"});
    }


    
}


//================================================================
/**
 * Handle Get Modal
 * @param {object} res 
 * @param {object} req 
 */
async function handleGetModal(res, req) {
    //Sanity check
    if(
        isUndefined(req.body.name) ||
        typeof req.body.name !== 'string'
    ){
        res.status(400);
        return res.send({type: 'danger', message: "Invalid Request - missing parameters"});
    }

    //Get admin data
    let admin = globals.authenticator.getAdminData(req.body.name);
    if(!admin) return res.send('Admin not found');

    //Prepare permissions
    let allPermissions = globals.authenticator.getPermissionsList();
    let permissions = allPermissions.map((perm) => {
        return {
            name: perm,
            checked: (admin.permissions.includes(perm))? 'checked' : ''
        }
    });

    //Set render data
    let renderData = {
        headerTitle: 'Admin Manager',
        username: admin.name,
        permissions: permissions
    }

    //Give output
    let out = await webUtils.renderSoloView('adminManager-editModal', renderData);
    return res.send(out);
}
