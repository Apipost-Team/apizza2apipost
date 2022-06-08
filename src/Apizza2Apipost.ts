class Apizza2Apipost {
  version: string;
  project: any;
  apis: any[];
  constructor() {
    this.version = '1.0';
    this.project = {};
    this.apis = [];
  }
  ConvertResult(status: string, message: string, data: any = '') {
    return {
      status,
      message,
      data
    }
  }
  validate(json: any) {
    if (json.hasOwnProperty('version')) {
      if (json.version !== '1.0') {
        return this.ConvertResult('error', 'Must contain a apizzaProject field 1.0');
      } else {
        this.version = '2.0';
      }
    }
    if (!json.hasOwnProperty('project_info')) {
      return this.ConvertResult('error', 'Must contain a apizzaProject field 1.0');
    }

    return this.ConvertResult('success', '');
  }
  handleInfo(json: any) {
    this.project.name = json?.project_info?.name || '新建项目';
    this.project.description = json?.project_info?.comment || '';
  }
  createNewApi(item: any) {
    var api: any = {
      name: item?.name || '新建接口',
      target_type: 'api',
      url: item?.url || "",
      method: item.method.toUpperCase() || 'GET',
      request: {
        'query': [],
        'header': [],
        'description': item?.description || '',
      }
    }
    const { request } = api;
    if(item.hasOwnProperty('query_params') && item.query_params instanceof Array){
      for (const i of item.query_params ) {
        i.key && request.query.push({
          is_checked:i.hasOwnProperty('checked') ? (i.checked != 1 ? '1' : '-1') : '1',
          type: 'Text',
          key: i.key,
          value: i.value || '',
          not_null: i.hasOwnProperty('require') ? (i.require != 1 ? '1' : '-1') : '1',
          description: i.desc || '',
          field_type: "Text"
        });
      }
    }
    if(item.hasOwnProperty('header_params') && item.header_params instanceof Array){
      for (const i of item.header_params ) {
        i.key && request.header.push({
          is_checked:i.hasOwnProperty('checked') ? (i.checked != 1 ? '1' : '-1') : '1',
          type: 'Text',
          key: i.key,
          value: i.value || '',
          not_null: i.hasOwnProperty('require') ? (i.require != 1 ? '1' : '-1') : '1',
          description: i.desc || '',
          field_type: "Text"
        });
      }
    }
    if(item.hasOwnProperty('body_type')){
      request.body = {
        "mode": "none",
        "parameter": [],
        "raw": '',
        "raw_para": []
      }
      if(item.body_type == 'x-www-form-urlencoded'){
        request.body.mode = 'urlencoded';
        if(item.hasOwnProperty('body_params') && item.body_params instanceof Array){
          item.body_params.forEach((param : any)=>{
            param.key && request.body.parameter.push(
              {
                is_checked: "1",
                type: 'Text',
                key: param.key || "",
                value: param.value || "",
                not_null: "1",
                description: param.desc || "",
                field_type: "Text"
              }
            )
          })
        }
      }else if(item.body_type == 'form-data' && item.body_params instanceof Array){
        request.body.mode = 'form-data';
        item.body_params.forEach((param : any)=>{
          param.key && request.body.parameter.push(
            {
              is_checked: "1",
              type:param.hasOwnProperty('rtype') && param.rtype == 'File' ? 'File' : 'Text',
              key: param.key || "",
              value: param.value || "",
              not_null: "1",
              description: param.desc || "",
              field_type: "Text"
            }
          )
        })
      }else if(item.body_type == 'raw' && item.hasOwnProperty('body_raw')){
        request.body.raw=item.body_raw || '';
      }
    }
    return api;
  }
  createNewFolder(item: any) {
    var newFolder: any = {
      'name': item?.name || '新建目录',
      'target_type': 'folder',
      'description': item?.comment || '',
      'children': [],
    };
    return newFolder;
  }
  handleApiAndFolder(items: any[], parent: any = null) {
    var root = this;
    for (const item of items) {
      let target;
      if (item.hasOwnProperty('api_list') && !item.hasOwnProperty('url')) {
        target = root.createNewFolder(item);
        root.handleApiAndFolder(item.api_list, target);
      }else{
        target = root.createNewApi(item);
      }
      if (parent && parent != null) {
        parent.children.push(target);
      } else {
        root.apis.push(target);
      }
    }
  }
  handleApiCollection(json: any) {
    if (!json.hasOwnProperty('categorys')) {
      return;
    }
    let categorys = json.categorys;
    if (categorys instanceof Array && categorys.length > 0) {
      this.handleApiAndFolder(categorys, null);
    }
  }
  convert(json: object) {
    var validationResult = this.validate(json);
    if (validationResult.status === 'error') {
      return validationResult;
    }
    this.handleInfo(json);
    this.handleApiCollection(json);
    validationResult.data = {
      project: this.project,
      apis: this.apis
    }
    console.log('project', JSON.stringify(validationResult));
    return validationResult;
  }
}

export default Apizza2Apipost;
