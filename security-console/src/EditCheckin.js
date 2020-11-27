/* src/App.js */
import React, { useState, useEffect } from 'react';
import FormGroup from '@material-ui/core/FormGroup';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

const App = (props) => {
  const [formState, setFormState] = useState(props.formState);

  useEffect(() => { 
    setFormState(props.formState);
  }, [props]);

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value });
  }

  function callSaveEditCheckin()
  {
    props.saveEditCheckin(formState);
  }

  function callSaveDeleteCheckin()
  {
    props.saveDeleteCheckin(formState);
  }

  return (
    <>
      <FormGroup>
        <TextField
          onChange={event => setInput('name', event.target.value)}
          value={formState.name}
          label="Name"
        />
        <TextField
          onChange={event => setInput('phone', event.target.value)}
          value={formState.phone}
          label="Phone"
        />
        <TextField
          onChange={event => setInput('postcode', event.target.value)}
          value={formState.postcode}
          label="Postcode"
        />
      </FormGroup>
      <ButtonGroup>
        <Button size='small' variant="contained" color="primary" onClick={() => callSaveEditCheckin()} disabled={!formState.id || !formState.name || !formState.phone || !formState.postcode || !formState.maskId}>Save Checkin</Button>&nbsp;
        <Button size='small' variant="contained" onClick={() => props.setEditing(false)} >Cancel</Button>&nbsp;
        <Button size='small' variant="contained" color="secondary" onClick={() => callSaveDeleteCheckin()}>DELETE</Button>
      </ButtonGroup>
    </>
  );
};


export default App;