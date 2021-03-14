import ExpressionParser from "service/ExpressionParser";
import { INPUT } from "../../constants";

export const assignTarget = {
  template: ({ params, id }) => {
    const parser = new ExpressionParser( id ),
          value = parser.stringify( params.value ),
          name = JSON.stringify( params.name );
    return `
      // Assign target dynamically
      bs.TARGETS[ ${ name } ] = async () => await bs.query( ${ value }, true, ${ name } );`;
  },


  toLabel: ({ params }) => `(\`${ params.name }\`, \`${ params.value }\`)`,
  toGherkin: ({ params }) => `Set value \`${ params.value }\` to target ${ params.name }`,

  commonly: "set target dynamically",

  description: `Assigns target dynamically`,

  params: [
    {
      legend: "",
      description: "",
      tooltip: "",
      fields: [
        {
          name: "params.name",
          control: INPUT,
          label: "Target name",
          description: `Target that takes in remotely delivered value`,
          rules: [{
            required: true,
            message: "This field is required"
          },
          {
            validator: ( rule, value, callback ) => {
              const reConst = /^[A-Z_\-0-9]+$/g;
              if ( !value ) {
                callback( `Field is required.` );
              }
              if ( !value.match( reConst ) ) {
                callback( `Shall be in all upper case with underscore separators` );
              }
              callback();
            }
          }
          ]
        },
        {
          name: "params.value",
          control: INPUT,
          label: "Value",
          description: `You can use [template expressions](https://docs.puppetry.app/template)`,
          rules: [{
            required: true,
            message: "This field is required"
          }]
        }
      ]
    }
  ],

  testTypes: {
    "params": {
      "name": "INPUT",
      "value": "INPUT"
    }
  },

  test: [
    {
      valid: true,
      "params": {
        "name": "FOO",
        "value": "foo"
      }
    }
  ]
};
