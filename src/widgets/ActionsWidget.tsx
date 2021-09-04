/* eslint-disable no-console */
import React, { useEffect } from 'react'
import { Space, Button, Modal, } from 'antd'
import { useDesigner } from '@designable/react'
import { observer } from '@formily/react'
import { loadInitialSchema, saveSchema } from '../service'
import { Field, Form, FormPath } from '@formily/core'

/**
 * 对象键值或者常规值, 空串转化成为null
 * @param data 
 * @returns object
 */
function transformEmptyStringToNull(data: any): any {
  if (data === '' || data === null) {
    return null
  } else if (typeof data === 'object') {
    // 数组&对象
    Object.keys(data).forEach((key: string) => {
      data[key] = transformEmptyStringToNull(data[key])
    })
  }
  return data
}

/**
 * 根据数据路径获取对应的field
 * @param dataPathStr 数据的路径 比如后端返回的a.b.c list.1.skuCode (遵循formPath规范)
 */
export function getFieldFromPath(dataPathStr: string, formGraph): Field | null {
  const { allFormInputField } = getAllInputFieldsInfo(formGraph);
  return allFormInputField[dataPathStr] || null;
}

/**
 * 获取所有的InputField和其对应的path
 * @param formGraph 
 * @returns 过滤掉VoidField以及根节点path为空的field, 以及其对应的排序后path数组
 */
function getAllInputFieldsInfo(formGraph: any) {
  const allFormInputField: any = {}
  const paths = Object.values(formGraph)
    // 过滤path不存在的
    .filter((field: any) => !!field.path && field.displayName !== 'VoidField')
    // 获取所有field的path
    .map((field: any) => {
      allFormInputField[field.path] = field
      return field.path
    })
    // FormPath长度排序
    .sort((path1: any, path2: any) => {
      const path1Length = path1.split('.').length
      const path2Length = path2.split('.').length
      return path1Length - path2Length
    })
  return {
    allFormInputField,
    paths,
  }
}

/**
 * 获取表单的值, 就算用户没有填写值, 也把该有的结构进行返回
 * @param form 表单对象 
 */
function getFormValueWithStructure(form: Form): Record<string, any> {
  const submitValue: any =  {};
  // console.log(form.values)
  const formGraph = form.getFormGraph()

  const { paths, allFormInputField } = getAllInputFieldsInfo(formGraph)

  console.group('test_1');
  console.log('paths')
  console.log(paths)
  console.log('allFormInputField')
  console.log(allFormInputField)
  console.groupEnd();

  paths.forEach((key: string) => {
    const field = allFormInputField[key] as Field
    const filedPath = FormPath.parse(key)
    const parentFieldPath = filedPath.parent();
    const fieldValue = filedPath.getIn(form.values);
    // 如果formPath的值, 能够在form表单里面找到直接用现成的
    if (fieldValue != null) {
      console.group('formValueHasValue');
      console.log(filedPath.toString())
      console.log(fieldValue)
      console.log(submitValue)
      console.groupEnd();
      filedPath.setIn(submitValue, fieldValue);
    } else if (parentFieldPath && !parentFieldPath.getIn(submitValue)) {
      // 如果都没有填写的话, 需要构建submitValue的对象结构
      console.group('resetPath');
      console.log('--------', key, parentFieldPath.toString(), submitValue)
      console.groupEnd();
      parentFieldPath.setIn(submitValue, {})
    } else {
      // 兼容: 初始化没有填写任何值的时候, 过滤对于一些不存在inputValue属性的, 比如VoidField等 没有inputValue属性
      console.group('no inputValueKey');
      console.log('no_key', key, field);
      console.groupEnd();
      FormPath.setIn(submitValue, key, fieldValue || field?.inputValue || field?.initialValue || '')
    }
  })

  console.log('list.0.skucode = ', getFieldFromPath('list.0.skucode', formGraph))

  return transformEmptyStringToNull(submitValue);
}

export const ActionsWidget = observer((props: any) => {
  const designer = useDesigner()
  useEffect(() => {
    loadInitialSchema(designer)
  }, [])

  const submit = () => {
    const form: Form = props.getForm()

    // eslint-disable-next-line no-console
    console.log(form)

    const submitValue = getFormValueWithStructure(form);
    console.log('submitValue: 提交表单值');
    console.log(submitValue);
    Modal.info({
      width: '65%',
      title: '提交的表单结构',
      content: (
        <div style={{ userSelect: 'text', padding: '20px', }}>
          {/* <pre>{formatJsonString(submitValue)}</pre> */}
          <pre>{JSON.stringify(submitValue, null , 2)}</pre>
        </div>
      ),
    })
  }
  // 将没有填写的键值处理成字符串

  return (
    <Space style={{ marginRight: 10 }}>
      {props.showSubmit && (
        <Button
          onClick={() => {
            submit()
          }}
        >
          提交
        </Button>
      )}
      <Button
        onClick={() => {
          saveSchema(designer)
        }}
      >
        保存
      </Button>
      <Button
        type="primary"
        onClick={() => {
          saveSchema(designer)
        }}
      >
        发布
      </Button>
    </Space>
  )
})
