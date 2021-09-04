import React, { forwardRef, useEffect, useImperativeHandle, useMemo } from 'react'
import { 
  createForm,
  Field,
  FormPath,
  // onFormInitialValuesChange,
  registerValidateFormats,
  registerValidateLocale
} from '@formily/core'
import { createSchemaField } from '@formily/react'
import {
  Form,
  FormItem,
  DatePicker,
  Checkbox,
  Cascader,
  Editable,
  Input,
  NumberPicker,
  Switch,
  Password,
  PreviewText,
  Radio,
  Reset,
  Select,
  Space,
  Submit,
  TimePicker,
  Transfer,
  TreeSelect,
  Upload,
  FormGrid,
  FormLayout,
  FormTab,
  FormCollapse,
  ArrayTable,
  ArrayCards,
} from '@formily/antd'
import { Card, Slider, Rate, } from 'antd'
import { TreeNode } from '@designable/core'
import { transformToSchema } from '@designable/formily'
import { getFieldFromPath } from './ActionsWidget'

const Text: React.FC<{
  content?: string
  mode?: 'normal' | 'h1' | 'h2' | 'h3' | 'p'
}> = ({ mode, content, ...props }) => {
  const tagName = mode === 'normal' || !mode ? 'div' : mode
  return React.createElement(tagName, props, content)
}

const SchemaField = createSchemaField({
  components: {
    Space,
    FormGrid,
    FormLayout,
    FormTab,
    FormCollapse,
    ArrayTable,
    ArrayCards,
    FormItem,
    DatePicker,
    Checkbox,
    Cascader,
    Editable,
    Input,
    Text,
    NumberPicker,
    Switch,
    Password,
    PreviewText,
    Radio,
    Reset,
    Select,
    Submit,
    TimePicker,
    Transfer,
    TreeSelect,
    Upload,
    Card,
    Slider,
    Rate,
  },
})

export interface IPreviewWidgetProps {
  tree: TreeNode
  ref: React.Ref<HTMLButtonElement>
  setShowSubmit?: (show: boolean) => void;
}

const fetchData = async () => {
  const  data = await fetch('http://127.0.0.1:5500/mock.data.json').then(response => response.json());
  return data;
}

export const PreviewWidget: React.FC<IPreviewWidgetProps> = forwardRef((props: any, ref: any) => {
  const form: any = useMemo(() => createForm({
    // effects() {}
  }), [])

  useMemo(async () => {
    try {
      const data = await fetchData();
      form.setInitialValues(data);
      form.setValues(data);
      const initialValues = data;
      // 配置好依赖
      const globalData = initialValues?.__global__data__;
      if (globalData) {
        Object.entries(globalData).forEach(([reactiveKey, dep]: any) => {
          const stateField = getFieldFromPath(reactiveKey, form.getFormGraph());
          const reactiveField: Field = form.fields[stateField.address as any];
          if (reactiveField) {
            const depValue = FormPath.getIn(form.initialValues, dep.depKey);
            // 表单显示隐藏模式 
            const displayModes = ["visible", "hidden", "none"];
            // 表单交互模式 
            const patternModes = ["editable", "disabled", "readOnly", "readPretty"];
            if (depValue == dep.depValue) {
              if (displayModes.includes(dep.pattern)) {
                reactiveField.setDisplay(dep.pattern);
              } else if (patternModes.includes(dep.pattern)) {
                reactiveField.setPattern(dep.pattern);
              } else {
                reactiveField.setPattern('disabled');
              }
            }
          }
        });
      }
    } catch (e) {
    }
  }, []);

  const { form: formProps, schema } = transformToSchema(props.tree, {
    designableFormName: 'Root',
    designableFieldName: 'DesignableField',
  })
  useEffect(() => {
    props?.setShowSubmit(true);
    return () => {
      props?.setShowSubmit(false)
    }
  }, [])
  useImperativeHandle(
    ref,
    () => ({
      getForm() {
        return form
      },
    }),
    []
  )
  return (
    <Form {...formProps} form={form}>
      <SchemaField schema={schema} />
    </Form>
  )
});
