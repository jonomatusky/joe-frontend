import React from 'react'
import { Grid, Box, Typography, Button, Paper, IconButton } from '@mui/material'
import * as Yup from 'yup'
import { useNavigate } from 'react-router'

import useOrganizationsStore from 'hooks/store/use-organizations-store'
import LayoutDialogEdit from 'layouts/LayoutDialogEdit'
import useContentStore from 'hooks/store/use-content-store'
import useContentTypesStore from 'hooks/store/use-content-types-store'
import useFormHelper from 'hooks/use-form-helper'
import DialogCreateEditCompany from 'pages/ViewContent/components/DialogCreateEditCompany'
import useUserStore from 'hooks/store/use-user-store'
import useResourcesStore from 'hooks/store/use-resources-store'
import { Delete, Edit } from '@mui/icons-material'
import Form from 'components/Form/Form'

const DialogResources = ({ open, onClose, id }) => {
  const {
    create,
    update,
    updateStatus,
    createStatus,
    select: selectContent,
  } = useContentStore()
  const { items: contentTypes, select: selectContentType } =
    useContentTypesStore()
  const { items: organizations, select: selectOrganization } =
    useOrganizationsStore()
  const { item: user } = useUserStore()
  const { items: resources } = useResourcesStore()

  const content = !!id ? selectContent(id) : {}

  const setupStage = !!id ? content.setupStage : null
  const isSetup = setupStage === 'about'

  const handleSubmit = async values => {
    let { organization: organizationId, ...newValues } = values
    let contentType = selectContentType(values.type)

    !id && (newValues.owner = user.id)
    !id && (newValues.organizations = [organizationId])

    let date = values.date ? new Date(values.date) : new Date()

    const organization = selectOrganization(organizationId) || {}

    newValues.titleInternal =
      organization.name +
      ' ' +
      contentType.secondary +
      ' ' +
      contentType.primary +
      ' ' +
      date.toLocaleDateString('en-us', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })

    newValues.setupStage =
      !isSetup && !!id
        ? null
        : contentType.secondary === 'New Hire' ||
          contentType.secondary === 'Board Appointment'
        ? 'hiring'
        : 'subject'

    try {
      if (!!id) {
        await update({ id, ...newValues })
      } else {
        const c = await create(newValues)
        window.location.hash = ''
        navigate(`/content/${c.id}`)
      }

      onClose()
    } catch (err) {}
  }

  const types = [
    'Website',
    'Notes',
    'Transcript',
    'Email',
    'Q&A',
    'Resume',
    'One-Pager',
  ]

  const formFields = [
    {
      label: 'Resource Type',
      name: 'type',
      options: types,
      type: 'auto',
      validation: Yup.string().required('Type is required'),
    },
    {
      label: 'Text',
      name: 'text',
      placeholder: 'Paste text here',
      validation: Yup.string().required('Type is required'),
    },
  ]

  const { control, submit, reset, watch } = useFormHelper({
    formFields,
    initialValues: {
      date: content.date,
      type: content.type,
      organization: content.organizations?.[0],
    },
    onSubmit: handleSubmit,
  })

  const handleClose = async () => {
    if (isSetup && !!id) {
      let contentType = selectContentType(content.type)

      await update({
        id,
        setupStage:
          contentType.secondary === 'New Hire' ||
          contentType.secondary === 'Board Appointment'
            ? 'hiring'
            : 'subject',
      })
    }
    reset()
    onClose()
  }

  const orgId = watch('organization')

  const navigate = useNavigate()

  const handleOpen = () => {}

  return (
    <>
      <LayoutDialogEdit
        title={
          <Box display="flex" alignItems="center" justifyContent="center">
            {/* <NoteAdd /> */}
            <Box>Add Resource</Box>
          </Box>
        }
        open={open || isSetup}
        onClose={handleClose}
        onSave={submit}
        loading={updateStatus === 'loading' || createStatus === 'loading'}
        label={isSetup ? 'Next' : 'Save'}
        cancelLabel={isSetup ? 'Skip' : 'Cancel'}
      >
        <Grid container justifyContent="center" spacing={3} pb={2} pt={1}>
          <Grid item xs={12}>
            <Form formFields={formFields} submit={submit} control={control} />
          </Grid>
        </Grid>
      </LayoutDialogEdit>
    </>
  )
}

export default DialogResources