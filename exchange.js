todos.ts
import { BASE_URI, credentials } from "../config";
import { todoType } from '../types';
import { addToEvents, getVariable } from '../globalVariables';
import { getTodosPromise } from '../utils';

export default function () {
    const phrase = new URL(document.location.href).searchParams.get(
        'phrase'
    );

    if (!!phrase) {
        alert(`${getVariable('newTodoText')} is added successfully`);
    }

    getTodosPromise().then((todos: todoType[]) => {
        const currentUserTodos: todoType[] = todos.filter((todo: todoType) => {
            return todo.author.toString() === sessionStorage.getItem('userId');
        })
        constructTodoList(currentUserTodos);
    });

    function constructTodoList(todos: todoType[]) {
        const todosList = new DocumentFragment();

        todos.forEach((todo: todoType) => {
            const checkbox: HTMLInputElement = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = todo.id.toString();
            checkbox.addEventListener('change', () => {
                todo.isComplete = !todo.isComplete;
                toggleCheckbox(todo.id, todo);
            });
            if (todo.isComplete) {
                checkbox.setAttribute("checked", "checked");
            }
            todosList.appendChild(checkbox);

            const text: HTMLElement = document.createElement('span');
            let newLabel: string = '';
            if (getVariable('newTodoText') === todo.text) {
                newLabel = '(NEW!)';
            }
            text.className = 'todo-text';
            text.textContent = `${todo.text} ${newLabel}`;
            todosList.appendChild(text);

            const br: HTMLElement = document.createElement('br');
            todosList.appendChild(br);
        });

        const toAdd: HTMLButtonElement = document.createElement('button');
        toAdd.id = 'toAdd';
        toAdd.innerHTML = 'Add new todo';
        toAdd.addEventListener('click', () => {
            const elems = $('.todo-text');
            _.each(elems, (elem: HTMLElement) => {
                elem.style.background = 'red';
            })

            $("#toAdd").hide(300);

            setTimeout(() => {
                history.push('/add');
            }, 500);
        });
        todosList.appendChild(toAdd);

        const searchinput: HTMLInputElement = document.createElement('input');
        searchinput.id = 'searchInput';
        searchinput.placeholder = 'Enter search phrase';
        todosList.appendChild(searchinput);

        const searchButton: HTMLButtonElement = document.createElement('button');
        searchButton.id = 'searchButton';
        searchButton.innerHTML = 'Search by phrase';
        searchButton.addEventListener('click', () => {
            const inputElement = <HTMLInputElement>document.getElementById('searchInput');
            const input = inputElement.value.trim();

            history.push('/search?phrase=' + input);

        });
        todosList.appendChild(searchButton);

        const mainElement: HTMLElement = document.getElementById('main');
        mainElement.appendChild(todosList);
        return todosList;
    }

    async function toggleCheckbox(id: number, todo: todoType) {
        const response = await fetch(BASE_URI + '/todos/' + id, {
            method: 'PUT',
            credentials: credentials,
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                Authorization: `Bearer ${sessionStorage.getItem('bearer')}`,
            },
            body: JSON.stringify(todo),
        });
        if (!response) {
            const log: any = JSON.parse(localStorage.getItem('log')) || [];
            log.push(`Error when changing status for todoId: ${id} at ${Date.now()}`);
            localStorage.setItem('log', JSON.stringify(log));
        } else {
            addToEvents(`Status toggled for todoId: ${id} at ${Date.now()}`);
        }
    }

    return '';
}


GlobalVariables.ts 

let globalVariables: Record<string, any> = {
    errorLog: [],
    events: [],
};

export function setVariable(key: string, value: string): void {
    globalVariables[key] = value;
}

export function getVariable(key: string): any {
    return globalVariables[key];
}

export function addToErrorLog(message: string): void {
    globalVariables.errorLog.push(message);
}

export function addToEvents(event: string): void {
    globalVariables.events.push(event);
}
