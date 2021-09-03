import React, { forwardRef, useEffect, useImperativeHandle, useMemo } from 'react'
import { createForm } from '@formily/core'
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

export const PreviewWidget: React.FC<IPreviewWidgetProps> = forwardRef((props: any, ref: any) => {
  const form = useMemo(() => createForm(), [])
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
