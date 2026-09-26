‘use client’;

import React, { useEffect, useState } from ‘react’;
import {
TransactionButton,
useActiveAccount,
useReadContract,
} from ‘thirdweb/react’;
import { prepareContractCall, toEther, toWei } from ‘thirdweb’;
import StaticCont from ‘./StaticCont’;
import { contract } from ‘../utils/contract’;

type Task = {
description: string;
isCompleted: boolean;
};

const Accountability = () => {
const account = useActiveAccount();
const add = account?.address as string;

const [amount, setAmount] = useState(0);
const [isModalOpen, setIsModalOpen] = useState(false);
const [taskDescription, setTaskDescription] = useState(’’);
const [tasks, setTasks] = useState<Task[]>([]);
const [money, setMoney] = useState(’’);

const { data: depositAmount } = useReadContract({
contract,
method: ‘getBalance’,
params: [add],
});

const { data: taskCount } = useReadContract({
contract,
method: ‘getTasksCount’,
params: [add],
});

const { data: taskComing } = useReadContract({
contract,
method: ‘getTasks’,
params: [add],
});

useEffect(() => {
if (depositAmount) {
const ethValue = toEther(depositAmount);
setMoney(ethValue);
} else {
setMoney(‘0’);
}
}, [depositAmount]);

useEffect(() => {
if (taskComing) {
setTasks([…taskComing]);
} else {
setTasks([]);
}
}, [taskComing]);

if (!account) {
return ;
}

const hasNoFunds = depositAmount?.toString() === ‘0’;
const hasNoTasks = taskCount?.toString() === ‘0’;
const hasFunds = depositAmount?.toString() !== ‘0’;
const hasTasks = taskCount?.toString() !== ‘0’;

return (
Your Accountability Dashboard

    <p className="text-small">
      Account: {account.address}
    </p>
  </div>
  <div className="accountability-content">
    {hasNoFunds && hasNoTasks && (
      <div>
        <h2 className="subtitle">Add funds now</h2>
        <div style={{ marginBottom: '16px' }}>
          <label
            htmlFor="deposit"
            className="text-small"
            style={{
              display: 'block',
              marginBottom: '4px',
            }}
          >
            Deposit Amount
          </label>
          <input
            id="deposit"
            type="number"
            min="0"
            step="0.001"
            placeholder="0.001 ETH"
            className="input"
            value={amount}
            onChange={(e) =>
              setAmount(Number(e.target.value))
            }
          />
        </div>
        <TransactionButton
          transaction={() =>
            prepareContractCall({
              contract,
              method: 'depositFunds',
              value: BigInt(toWei(amount.toString())),
            })
          }
          onTransactionConfirmed={() => {
            alert('Transaction Confirmed');
            setAmount(0);
          }}
          className="button"
          style={{ width: '100%' }}
        >
          Deposit Funds
        </TransactionButton>
      </div>
    )}
    {hasFunds && hasNoTasks && (
      <div>
        <h2 className="subtitle">Your Current Status</h2>
        <h2 className="subtitle1">
          Deposited funds: {money} ETH
        </h2>
        <p
          style={{
            marginBottom: '16px',
            fontSize: '18px',
          }}
          className="subtitle1"
        >
          Task Count: {taskCount?.toString()}
        </p>
        <button
          onClick={() => setIsModalOpen(true)}
          className="button"
          style={{ width: '100%' }}
        >
          Add Task
        </button>
      </div>
    )}
    {hasFunds && hasTasks && (
      <>
        <div style={{ marginBottom: '24px' }}>
          <h2 className="subtitle1">
            Deposited funds: {money} ETH
          </h2>
          <p
            style={{
              marginBottom: '16px',
              fontSize: '18px',
            }}
            className="subtitle1"
          >
            Task Count: {taskCount?.toString()}
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="button"
            style={{ width: '100%' }}
          >
            Add Task
          </button>
        </div>
        <div>
          <h2 className="subtitle">My Tasks</h2>
          <ul className="task-list">
            {tasks
              .map((task, originalIndex) => ({
                ...task,
                originalIndex,
              }))
              .filter((task) => !task.isCompleted)
              .map((taskWithIndex) => (
                <li
                  key={taskWithIndex.originalIndex}
                  className="task-item"
                >
                  <span>
                    {taskWithIndex.description}
                  </span>
                  <TransactionButton
                    transaction={() =>
                      prepareContractCall({
                        contract,
                        method: 'completeTask',
                        params: [
                          BigInt(
                            taskWithIndex.originalIndex
                          ),
                        ],
                      })
                    }
                    onTransactionConfirmed={() => {
                      alert(
                        'Task completed successfully'
                      );
                      console.log(
                        'Task at original index:',
                        taskWithIndex.originalIndex
                      );
                    }}
                    onClick={() =>
                      console.log(
                        'Clicked task at original index:',
                        taskWithIndex.originalIndex
                      )
                    }
                    className="button"
                    style={{
                      fontSize: '14px',
                      padding: '6px 12px',
                    }}
                  >
                    Complete
                  </TransactionButton>
                </li>
              ))}
          </ul>
        </div>
      </>
    )}
    {isModalOpen && (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2 className="subtitle">Add New Task</h2>
          <textarea
            placeholder="Enter task description"
            className="textarea"
            style={{ marginBottom: '16px' }}
            rows={4}
            value={taskDescription}
            onChange={(e) =>
              setTaskDescription(e.target.value)
            }
          />
          <div
            style={{
              display: 'flex',
              gap: '8px',
            }}
          >
            <TransactionButton
              transaction={() =>
                prepareContractCall({
                  contract,
                  method: 'createTask',
                  params: [taskDescription],
                })
              }
              onTransactionConfirmed={() => {
                alert('Task added successfully');
                setIsModalOpen(false);
                setTaskDescription('');
              }}
              className="button"
              style={{ flex: 1 }}
            >
              Add Task
            </TransactionButton>
            <button
              onClick={() => setIsModalOpen(false)}
              className="button button-secondary"
              style={{ flex: 1 }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
</div>

);
};

export default Accountability;