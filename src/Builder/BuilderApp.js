import React, {useState} from "react";
import {SubmitButton} from "./SubmitButton";
import {createForm} from "../service/BuilderService";
import './BuilderApp.css'
import {randomID} from "../RandomGenerator/RandomID";

const MAX_CHOICES = 2; //Max Number of Choices
//All Possible Orders
const Order = [
    {value: "NONE", option: "None", _id: '1'},
    {value: 'ALPHA', option: 'Display in Alphabetical', _id: '2'},
    {value: 'LENGTH', option: 'Display in Length', _id: '3'}
]

const Builder = () => {
    const [choices, setChoices] = useState([]);
    const [newChoice, setNewChoice] = useState("");
    const [defaultvalue, setDefaultValue] = useState("");
    const [over50Warning, set50Warning] = useState("hidden");
    const [multiSelect, setMultiSelect] = useState(false);
    const [order, setOrder] = useState(null); //Order Change Event
    const [label, setLabel] = useState("");

    /**
     * Clear/Reset all states
     */
    const handleClear = () => {
        setChoices([]);
        setNewChoice("");
        setDefaultValue("");
        set50Warning("hidden");
        setLabel("");
        if(order !== null) {
            // Mock the change to set the order to none
            order.selectedIndex = 0;
            setOrder(null);
        }
        setMultiSelect(false);
    }

    /**
     * Submit the form and post it to the API
     */
    const handleSubmit = async (e) => {
        // e.preventDefault();
        if (label === "") {
            alert("Label field is required");
            return;
        }

        let seen = false; //represent if default value is in choices.
        for (const c of choices) {
            if (c.Choice === defaultvalue) {
                seen = true;
                break;
            }
        }

        let realChoices = choices; //represent the choices with possible unseen default value
        if (!seen && defaultvalue !== "") {
            const choice = {
                Choice: defaultvalue, _id: randomID()
            }
            realChoices = [...realChoices, choice];
            if (realChoices.length > MAX_CHOICES) {
                alert("default value not in choices");
                return;
            }
            setChoices(realChoices);
            // State updates in React are not applied immediately. Instead,
            // they are placed in a queue and scheduled. In fact,
            // React does not apply the new values to the state until the component is reconciled.
            // Thus, I need realChoices instead of choices to be in the JSON request.
        }

        //If did not select order, return the NONE
        let choiceOrder = (order === null) ? Order[0].value
                                           : order.options[order.selectedIndex].value;
        let form = {
            Label: label,
            multiSelect: multiSelect,
            defaultValue: defaultvalue,
            choices: realChoices,
            order: choiceOrder
        }

        form = JSON.stringify(form);
        const response = await createForm(form);
        console.log(response);
        console.log(form);
    }

    /**
     * Add a new Choice
     */
    const addNewChoice = () => {
        if (newChoice === "") {
            alert("choice cannot be empty");
            return;
        }
        for (const c of choices) {
            if (c.Choice === newChoice) {
                alert("duplicate choice");
                return;
            }
        }
        if (choices.length >= MAX_CHOICES) {
            set50Warning('visible');
            return;
        } else {
            set50Warning('hidden');
        }
        const choice = {
            Choice: newChoice, _id: randomID()
        }
        setChoices([...choices, choice]);
        setNewChoice('');
    }

    /**
     * Remove a choice from Choice list
     */
    const remove = () => {
        if (newChoice === "") {
            alert("choice cannot be empty");
            return;
        }
        const originLength = choices.length;
        const new_choices = choices.filter(c => c.Choice !== newChoice);
        if (originLength === new_choices.length) {
            alert("Choice did not find");
            return;
        }
        alert("Choice " + newChoice +" deleted");
        if (choices.length <= MAX_CHOICES) {
            set50Warning("hidden");
        }
        setChoices(new_choices);
        setNewChoice('');
    }

    return(
        <div>
            <div className="title">Field Builder</div>
            <form className={'form'} onSubmit={handleSubmit}>
                <div className="form-control">
                    <label>Label </label>
                    <input type="text"
                           placeholder={'Required Field'}
                           value={label}
                           onChange={(e) =>
                               setLabel(e.target.value)}/>
                </div>
                <div className="form-control">
                    <label>Type </label>
                    <span>Multi-select
                        <input type="checkbox"
                               className={'check-box'}
                               onChange={(e) =>
                                   setMultiSelect(e.target.checked)}
                               checked={multiSelect}/>
                        A Value is required
                    </span>
                </div>
                <div className="form-control">
                    <label>Default Value </label>
                    <input type="text"
                           value={defaultvalue}
                           onChange={(e) =>
                               setDefaultValue(e.target.value)}/>
                </div>
                <div className="form-control">
                    <label>Choices </label>
                    <select>
                        {
                            choices.map( choice => {
                                return (<option key={choice._id}>{choice.Choice}</option>)
                            })
                        }
                    </select>
                </div>
                <div className="form-control">
                    <label>Add/Remove Choices</label>
                    <span>
                        <input type="text"
                               onChange={(e) =>
                                   setNewChoice(e.target.value)}
                               value={newChoice}/>
                        <span className={'choice-btn'}
                              onClick={addNewChoice}>+</span>
                        <span className={'choice-btn'}
                              onClick={remove}>-</span>
                    </span>
                </div>
                <div className="form-control">
                    <div/>
                    <span className={'over-max-choice'}
                          style={{visibility: over50Warning}}>Over Max {MAX_CHOICES} Choices!</span>
                </div>
                <div className="form-control">
                    <label>Order </label>
                    <select
                            onChange={(e) => setOrder(e.target)}>
                        {
                            Order.map(
                                order =>
                                    <option value={order.value}
                                            key={order._id}>{order.option}</option>
                            )
                        }
                    </select>
                </div>

                <div className="form-control">
                    <button className={'clear-btn'} type={'button'}
                            onClick={() => handleClear()}>
                        Clear
                    </button>
                    <div className={'save'}>
                        {<SubmitButton type={'button'}
                                       words={'Save changes'}
                                       event={handleSubmit}/>}
                        <span> Or <span className={'cancel'}> Cancel </span>
                        </span>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default Builder;