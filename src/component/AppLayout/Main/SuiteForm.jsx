import React from "react";
import PropTypes from "prop-types";
import AbstractForm from "component/AbstractForm";
import { ruleValidateGenericString } from "service/utils";
import { message, Form, Input, InputNumber, Button } from "antd";
import { ProfileOutlined } from "@ant-design/icons";
const FormItem = Form.Item,
      { TextArea } = Input,
      connectForm = Form.create();

@connectForm
export class SuiteForm extends AbstractForm {

  static propTypes = {
    title: PropTypes.string,
    timeout: PropTypes.number,
    form: PropTypes.shape({
      validateFieldsAndScroll: PropTypes.func.isRequired,
      getFieldDecorator: PropTypes.func.isRequired,
      getFieldsError: PropTypes.func.isRequired
    }),
    action: PropTypes.shape({
      updateSuite: PropTypes.func.isRequired,
      saveSuite: PropTypes.func.isRequired
    })
  }

  state = {
    modified: false
  }

  onChange = () => {
    this.setState({ modified: true });
  }

  onSubmit = ( e ) => {
    e.preventDefault();
    this.setState({ modified: false });
    this.props.form.validateFieldsAndScroll( ( err, values ) => {
      if ( !err ) {
        const title = values.title,
              timeout = values.timeout,
              description = values.description,
              { updateSuite, autosaveSuite }  = this.props.action;

        updateSuite({ title, timeout, description });
        autosaveSuite();
        message.info( `Data has been successfully updated` );
        this.props.form.resetFields();
      }
    });
  }

  render() {
    const { getFieldDecorator, getFieldsError } = this.props.form;

    return (
      <Form id="cSuiteForm" onSubmit={ this.onSubmit }>
        <FormItem  label="Suite title">
          { getFieldDecorator( "title", {
            initialValue: this.props.title,
            rules: [
              {
                required: true, message: "Please enter suite name"
              },
              {
                validator: ruleValidateGenericString
              },
              {
                transform: ( value ) => value.trim()
              }
            ]
          })(
            <Input
              onPressEnter={this.onSubmit}
              onChange={ this.onChange }
              placeholder="Describe suite"
              prefix={ <ProfileOutlined title="Suite" /> }
            />
          )}

        </FormItem>
        <FormItem label="Description">
          { getFieldDecorator( "description", {
            initialValue: this.props.description || ""
          })( <TextArea
            onChange={ this.onChange }
            rows={ 2 } /> ) }
        </FormItem>
        <FormItem  label="Test timeout (ms)">
          { getFieldDecorator( "timeout", {
            initialValue: ( this.props.timeout || 50000 ),
            rules: [
              {
                required: true, message: "Please enter timeout (ms)"
              }
            ]
          })(
            <InputNumber
              onChange={ this.onChange }
              onPressEnter={this.onSubmit}
            />
          )}

        </FormItem>
        <FormItem>
          <Button
            id="cSuiteFormChangeBtn"
            type="primary"
            htmlType="submit"
            disabled={ !this.state.modified || this.hasErrors( getFieldsError() ) }
          >Save</Button>
        </FormItem>
      </Form>
    );
  }
}
