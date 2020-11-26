/* src/App.js */
import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import FormGroup from '@material-ui/core/FormGroup'
import TextField from '@material-ui/core/TextField'
import AddIcon from '@material-ui/icons/Add'
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'

const initialState = { name: '', phone: '', postcode: '', maskId: '' }

const useStyles = makeStyles((theme) => ({
  container: {
    padding: 10,
  },
}))

const App = (props) => {
  const [formState, setFormState] = useState(initialState)

  const classes = useStyles()

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value })
  }

  function callSaveAddCheckin()
  {
    props.saveAddCheckin(formState)
    setFormState(initialState)
  }

  return (
    <Paper elevation={3} className={classes.container}>
      <FormGroup>
        <TextField
          onChange={event => setInput('name', event.target.value)}
          value={formState.name}
          label="Name"
        /><br />
        <TextField
          onChange={event => setInput('phone', event.target.value)}
          value={formState.phone}
          label="Phone"
        /><br />
        <TextField
          onChange={event => setInput('postcode', event.target.value)}
          value={formState.postcode}
          label="Postcode"
        /><br />
        <TextField
          onChange={event => setInput('maskId', event.target.value)}
          value={formState.maskId}
          label="Mask ID"
        />
        <br />
        <Button size='small' variant="contained" color="primary" fullWidth={false} onClick={callSaveAddCheckin} disabled={!formState.name || !formState.phone || !formState.postcode || !formState.maskId}><AddIcon /> Create Checkin</Button>
      </FormGroup>
    </Paper>
  )
}

export default App