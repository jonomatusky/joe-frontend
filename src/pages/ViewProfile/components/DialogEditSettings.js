import React from 'react'
import { useParams } from 'react-router-dom'
import * as Yup from 'yup'
import { Grid } from '@mui/material'
import useIndividualStore from 'hooks/store/use-individuals-store'
import LayoutDialogEdit from 'layouts/LayoutDialogEdit'
import Form from 'components/Form/Form'
import useFormHelper from 'hooks/use-form-helper'

const DialogEditSettings = ({ open, onClose }) => {
  const { update, updateStatus, select } = useIndividualStore()
  const { pid } = useParams()
  const individual = select(pid)

  const formFields = [
    {
      name: 'team',
      label: 'Team',
      placeHolder: 'Team Awesome',
      helpText:
        'This is only shown internally, to help other teams reach out if they have an opportunity',
      type: 'text',
      validation: Yup.string().max(50, 'Must be under 50 characters'),
    },
    {
      name: 'email',
      label: 'Contact Email',
      placeHolder: 'client@gregoryfca.com',
      type: 'email',
      helpText:
        'This is the email journalists will use to reach out to you. It is shown publicly.',
      validation: Yup.string().email('Must be a valid email address'),
    },
    {
      name: 'isPrivate',
      label: `Hide from Gregory FCA's internal list of contacts`,
      placeHolder: 'client@gregoryfca.com',
      type: 'boolean',
      helpText: `The profile will remain publicly available via direct link. Check this box if you don't want any other teams to reach out about this contact, or if they is no long a client.`,
      validation: Yup.string().email('Must be a valid email address'),
    },
  ]

  const handleSubmit = async values => {
    try {
      await update({ id: pid, ...values })
      onClose()
    } catch (err) {}
  }

  const { control, submit, reset } = useFormHelper({
    formFields,
    initialValues: individual,
    onSubmit: handleSubmit,
  })

  const handleClose = () => {
    onClose()
    reset()
  }

  return (
    <LayoutDialogEdit
      title="Edit Settings"
      open={open}
      onClose={handleClose}
      onSave={submit}
      loading={updateStatus === 'loading'}
    >
      <Grid container spacing={2} justifyContent="center" pb={2} pt={2}>
        <Grid item xs={12}>
          <Form
            control={control}
            onSubmit={submit}
            formFields={formFields}
            initialValues={individual}
          />
        </Grid>
      </Grid>
    </LayoutDialogEdit>
  )
}

export default DialogEditSettings
