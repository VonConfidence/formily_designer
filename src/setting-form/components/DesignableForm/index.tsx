import React, { useMemo } from 'react'
import { IDesignerProps, GlobalRegistry } from '@designable/core'
import { createForm } from '@formily/core'
import { Form, IFormLayoutProps } from '@formily/antd'
import { observer } from '@formily/react'
import { usePrefix } from '@designable/react'
import { Form as FormPropsSchema } from '../../schemas'
import './styles.less'

export interface IDesignableFormFactoryProps extends IDesignerProps {
  registryName: string
  component?: React.JSXElementConstructor<unknown>
}

export const createDesignableForm = (options: IDesignableFormFactoryProps) => {
  const realOptions: IDesignableFormFactoryProps = {
    component: Form,
    droppable: true,
    draggable: false,
    propsSchema: FormPropsSchema,
    ...options,
    defaultProps: {
      labelCol: 6,
      wrapperCol: 12,
      ...options.defaultProps,
    },
  }

  const FormComponent = realOptions.component || Form

  const DesignableForm: React.FC<IFormLayoutProps> = observer((props) => {
    const prefix = usePrefix('designable-form')
    const form = useMemo(
      () => {
        const tForm = createForm({
          designable: true,
        })
        // tForm.createObjectField({
        //   name: '__global_server_data__',
        //   value: { a: 1, b: 2 }
        // })
        // .onMount()
        return tForm;
      },
      []
    )

    return (
      <FormComponent
        {...props}
        style={{ ...props.style }}
        className={prefix}
        form={form}
      >
        {props.children}
      </FormComponent>
    )
  })

  if (!realOptions.registryName) throw new Error('Can not found registryName')

  realOptions.title = `components.${realOptions.registryName}`

  GlobalRegistry.registerDesignerProps({
    [realOptions.registryName]: realOptions,
  })

  return DesignableForm
}
