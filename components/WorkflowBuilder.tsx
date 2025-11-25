import React, { useState } from 'react';
import { Play, Save, Plus, Trash2, GripVertical, ChevronRight, Lock, Monitor, CloudOff, Code, X, Copy, Check } from 'lucide-react';
import { TestWorkflow, TestStep, UIElement, OperationType } from '../types';
import { OPS_DESCRIPTIONS } from '../constants';

interface WorkflowBuilderProps {
  workflows: TestWorkflow[];
  elements: UIElement[];
  onSaveWorkflow: (workflow: TestWorkflow) => void;
  onDeleteWorkflow: (id: string) => void;
}

// --- JAVA CODE REFLECTED IN MODAL ---
const JAVA_CODE_CONTROLLER = `package com.autoflow.controller;

import com.autoflow.dto.AutomationRequest;
import com.autoflow.dto.StepDTO;
import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173") // Allow Frontend Access
public class AutomationController {

    @PostMapping("/run-automation")
    public Map<String, Object> runAutomation(@RequestBody AutomationRequest request) {
        List<String> logs = new ArrayList<>();
        WebDriver driver = null;

        try {
            // Auto-setup ChromeDriver
            WebDriverManager.chromedriver().setup();
            
            ChromeOptions options = new ChromeOptions();
            options.addArguments("--remote-allow-origins=*");
            // options.addArguments("--headless"); // Enable for background execution
            
            driver = new ChromeDriver(options);
            driver.manage().window().maximize();
            driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(5));
            
            logs.add("🚀 Browser Started");

            for (int i = 0; i < request.getSteps().size(); i++) {
                StepDTO step = request.getSteps().get(i);
                logs.add(String.format("Step %d: %s", i + 1, step.getOperation()));

                try {
                    executeStep(driver, step);
                    logs.add("  ✅ Success");
                } catch (Exception e) {
                    logs.add("  ❌ Failed: " + e.getMessage());
                    throw e; // Stop execution on failure
                }
            }
            
            return Map.of("status", "SUCCESS", "logs", logs);

        } catch (Exception e) {
            logs.add("❌ Execution Interrupted: " + e.getMessage());
            return Map.of("status", "FAILURE", "logs", logs);
        } finally {
            if (driver != null) {
                logs.add("🏁 Closing Browser session.");
                driver.quit();
            }
        }
    }

    private void executeStep(WebDriver driver, StepDTO step) throws InterruptedException {
        switch (step.getOperation()) {
            case "OPEN_URL":
                driver.get(step.getValue());
                break;
            case "CLICK":
                driver.findElement(getLocator(step)).click();
                break;
            case "INPUT":
                driver.findElement(getLocator(step)).sendKeys(step.getValue());
                break;
            case "WAIT":
                long waitTime = Long.parseLong(step.getValue());
                Thread.sleep(waitTime);
                break;
            case "ASSERT_TEXT":
                String text = driver.findElement(getLocator(step)).getText();
                if (!text.contains(step.getValue())) {
                    throw new RuntimeException("Assertion Failed. Expected '" + step.getValue() + "' but found '" + text + "'");
                }
                break;
            case "CONFIRM_MODAL":
                driver.switchTo().alert().accept();
                break;
        }
    }

    private By getLocator(StepDTO step) {
        String value = step.getLocator();
        if (value == null || value.isEmpty()) return null;
        
        switch (step.getLocatorType()) {
            case "XPATH": return By.xpath(value);
            case "ID": return By.id(value);
            case "CSS": return By.cssSelector(value);
            default: throw new IllegalArgumentException("Unknown locator type: " + step.getLocatorType());
        }
    }
}`;

const JAVA_CODE_DTO = `package com.autoflow.dto;

import java.util.List;

public class AutomationRequest {
    private String workflowId;
    private List<StepDTO> steps;

    // Getters and Setters
    public String getWorkflowId() { return workflowId; }
    public void setWorkflowId(String workflowId) { this.workflowId = workflowId; }
    public List<StepDTO> getSteps() { return steps; }
    public void setSteps(List<StepDTO> steps) { this.steps = steps; }
}

// --- StepDTO.java ---
package com.autoflow.dto;

public class StepDTO {
    private String operation;
    private String locator;
    private String locatorType;
    private String value;
    
    // Getters and Setters
    public String getOperation() { return operation; }
    public void setOperation(String operation) { this.operation = operation; }
    public String getLocator() { return locator; }
    public void setLocator(String locator) { this.locator = locator; }
    public String getLocatorType() { return locatorType; }
    public void setLocatorType(String locatorType) { this.locatorType = locatorType; }
    public String getValue() { return value; }
    public void setValue(String value) { this.value = value; }
}`;

const JAVA_CODE_POM = `<dependencies>
    <!-- Spring Boot Web -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- Selenium Java -->
    <dependency>
        <groupId>org.seleniumhq.selenium</groupId>
        <artifactId>selenium-java</artifactId>
        <version>4.16.1</version>
    </dependency>
    
    <!-- WebDriverManager (Auto download chromedriver) -->
    <dependency>
        <groupId>io.github.bonigarcia</groupId>
        <artifactId>webdrivermanager</artifactId>
        <version>5.6.3</version>
    </dependency>
</dependencies>`;

export const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({ 
  workflows, 
  elements, 
  onSaveWorkflow, 
  onDeleteWorkflow 
}) => {
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(workflows[0]?.id || null);
  const [editingWorkflow, setEditingWorkflow] = useState<TestWorkflow | null>(workflows[0] ? { ...workflows[0] } : null);
  const [executionLog, setExecutionLog] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [useRealBrowser, setUseRealBrowser] = useState(false);
  
  // Java Code Modal State
  const [showJavaModal, setShowJavaModal] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState<'CONTROLLER' | 'DTO' | 'POM'>('CONTROLLER');
  const [copied, setCopied] = useState(false);

  const activeWorkflow = editingWorkflow;

  const handleSelectWorkflow = (id: string) => {
    if (isRunning) return; 
    const wf = workflows.find(w => w.id === id);
    if (wf) {
      setSelectedWorkflowId(id);
      setEditingWorkflow({ ...wf }); 
      setExecutionLog([]);
    }
  };

  const handleCreateNew = () => {
    if (isRunning) return;
    const newWf: TestWorkflow = {
      id: Date.now().toString(),
      name: 'New Test Flow',
      steps: [],
      lastRunStatus: 'NONE'
    };
    setEditingWorkflow(newWf);
    setSelectedWorkflowId(newWf.id);
    setExecutionLog([]);
  };

  const addStep = () => {
    if (!activeWorkflow) return;
    const newStep: TestStep = {
      id: Date.now().toString(),
      operation: 'CLICK',
      targetElementId: elements[0]?.id
    };
    setEditingWorkflow({
      ...activeWorkflow,
      steps: [...activeWorkflow.steps, newStep]
    });
  };

  const removeStep = (stepId: string) => {
    if (!activeWorkflow) return;
    setEditingWorkflow({
      ...activeWorkflow,
      steps: activeWorkflow.steps.filter(s => s.id !== stepId)
    });
  };

  const updateStep = (stepId: string, field: keyof TestStep, value: any) => {
    if (!activeWorkflow) return;
    setEditingWorkflow({
      ...activeWorkflow,
      steps: activeWorkflow.steps.map(s => s.id === stepId ? { ...s, [field]: value } : s)
    });
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault(); 
    if (draggedIndex === null || draggedIndex === index) return;
    if (!activeWorkflow) return;
    const newSteps = [...activeWorkflow.steps];
    const draggedItem = newSteps[draggedIndex];
    newSteps.splice(draggedIndex, 1);
    newSteps.splice(index, 0, draggedItem);
    setEditingWorkflow({ ...activeWorkflow, steps: newSteps });
    setDraggedIndex(index);
  };
  const handleDragEnd = () => { setDraggedIndex(null); };

  const handleSave = () => {
    if (activeWorkflow) {
      onSaveWorkflow(activeWorkflow);
      alert('Workflow saved successfully!');
    }
  };

  const runSimulation = async () => {
    if (!activeWorkflow) return;
    setExecutionLog(prev => [...prev, '--- STARTING SIMULATION MODE ---', 'Initializing virtual environment...']);
    
    for (let i = 0; i < activeWorkflow.steps.length; i++) {
      const step = activeWorkflow.steps[i];
      const opName = OPS_DESCRIPTIONS[step.operation].label;
      const elName = elements.find(e => e.id === step.targetElementId)?.name || 'Unknown Element';
      
      await new Promise(r => setTimeout(r, 800)); // Simulate delay
      
      let logMsg = `[STEP ${i + 1}] ${opName}`;
      if (step.operation === 'OPEN_URL') {
         logMsg += ` -> ${step.value}`;
      } else if (step.operation !== 'WAIT' && step.operation !== 'CONFIRM_MODAL') {
        logMsg += ` on "${elName}"`;
      }
      if (step.value && step.operation !== 'OPEN_URL') {
        logMsg += ` with value: "${step.value}"`;
      }
      setExecutionLog(prev => [...prev, logMsg, `  -> Success`]);
    }
    
    await new Promise(r => setTimeout(r, 500));
    setExecutionLog(prev => [...prev, 'Simulation Finished: PASSED']);
    setIsRunning(false);
  };

  const runRealBrowser = async () => {
    if (!activeWorkflow) return;

    setExecutionLog(['--- CONTACTING JAVA BACKEND ---', 'Sending payload to http://localhost:8080/api/run-automation ...']);

    // Prepare Payload: Map Element IDs to actual Locators for the backend
    const payload = {
      workflowId: activeWorkflow.id,
      steps: activeWorkflow.steps.map(step => {
        const element = elements.find(e => e.id === step.targetElementId);
        return {
          operation: step.operation,
          locator: element?.locator || '',
          locatorType: element?.locatorType || 'XPATH',
          value: step.value || ''
        };
      })
    };

    try {
      // Call Java Backend
      const response = await fetch('http://localhost:8080/api/run-automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`Server Error: ${response.status}`);

      setExecutionLog(prev => [...prev, '✅ Backend received request.', 'Browser launching on host machine...']);
      
      const result = await response.json();
      setExecutionLog(prev => [...prev, ...result.logs, `Final Status: ${result.status}`]);

    } catch (error: any) {
      console.error(error);
      setExecutionLog(prev => [
        ...prev, 
        '❌ CONNECTION FAILED', 
        `Could not connect to Java Backend at http://localhost:8080.`,
        '1. Ensure your Spring Boot app is running.',
        '2. Verify CORS is enabled in AutomationController.',
        'Falling back to Simulation Mode in 3 seconds...'
      ]);
      await new Promise(r => setTimeout(r, 3000));
      runSimulation();
      return;
    }
    
    setIsRunning(false);
  };

  const runTest = () => {
    if (isRunning) return;
    setIsRunning(true);
    setExecutionLog([]);
    if (useRealBrowser) {
      runRealBrowser();
    } else {
      runSimulation();
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 relative">
      {/* Java Code Modal */}
      {showJavaModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl flex flex-col border border-slate-700">
            <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-900 rounded-t-2xl">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <Code className="text-indigo-400" /> Backend Source Code
              </h3>
              <button onClick={() => setShowJavaModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex border-b border-slate-700 bg-slate-800">
              <button 
                onClick={() => setActiveCodeTab('CONTROLLER')}
                className={`px-6 py-3 text-sm font-medium transition-colors ${activeCodeTab === 'CONTROLLER' ? 'text-indigo-400 border-b-2 border-indigo-400 bg-slate-800/50' : 'text-slate-400 hover:text-white'}`}
              >
                Controller
              </button>
              <button 
                onClick={() => setActiveCodeTab('DTO')}
                className={`px-6 py-3 text-sm font-medium transition-colors ${activeCodeTab === 'DTO' ? 'text-indigo-400 border-b-2 border-indigo-400 bg-slate-800/50' : 'text-slate-400 hover:text-white'}`}
              >
                DTOs
              </button>
              <button 
                onClick={() => setActiveCodeTab('POM')}
                className={`px-6 py-3 text-sm font-medium transition-colors ${activeCodeTab === 'POM' ? 'text-indigo-400 border-b-2 border-indigo-400 bg-slate-800/50' : 'text-slate-400 hover:text-white'}`}
              >
                pom.xml
              </button>
            </div>

            <div className="flex-1 overflow-hidden relative group">
              <div className="absolute top-4 right-4 z-10">
                 <button 
                   onClick={() => copyCode(activeCodeTab === 'CONTROLLER' ? JAVA_CODE_CONTROLLER : activeCodeTab === 'DTO' ? JAVA_CODE_DTO : JAVA_CODE_POM)}
                   className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors shadow-lg border border-slate-600"
                 >
                   {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                   {copied ? 'Copied!' : 'Copy Code'}
                 </button>
              </div>
              <pre className="h-full overflow-auto p-6 text-sm font-mono text-slate-300 leading-relaxed bg-[#0d1117]">
                {activeCodeTab === 'CONTROLLER' && JAVA_CODE_CONTROLLER}
                {activeCodeTab === 'DTO' && JAVA_CODE_DTO}
                {activeCodeTab === 'POM' && JAVA_CODE_POM}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar List */}
      <div className={`w-64 flex-shrink-0 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col transition-opacity duration-300 ${isRunning ? 'opacity-60 pointer-events-none' : ''}`}>
        <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
          <h3 className="font-semibold text-slate-700 flex items-center gap-2">
            Workflows
            {isRunning && <Lock size={14} className="text-amber-500" />}
          </h3>
          <button onClick={handleCreateNew} className="text-indigo-600 hover:bg-indigo-50 p-1 rounded">
            <Plus size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto relative">
           {isRunning && <div className="absolute inset-0 z-10 bg-slate-50/50"></div>}
          {workflows.map(wf => (
            <div 
              key={wf.id}
              onClick={() => handleSelectWorkflow(wf.id)}
              className={`p-3 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${selectedWorkflowId === wf.id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : ''}`}
            >
              <div className="font-medium text-slate-800 truncate">{wf.name}</div>
              <div className="text-xs text-slate-500 mt-1 flex justify-between">
                <span>{wf.steps.length} steps</span>
                <span className={`uppercase ${wf.lastRunStatus === 'SUCCESS' ? 'text-green-600' : 'text-slate-400'}`}>{wf.lastRunStatus || 'NEW'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Builder Area */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        {activeWorkflow ? (
          <>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center">
              <input 
                value={activeWorkflow.name}
                onChange={(e) => setEditingWorkflow({...activeWorkflow, name: e.target.value})}
                disabled={isRunning}
                className="text-xl font-bold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 outline-none px-2 py-1"
              />
              <div className="flex items-center gap-3">
                 <button 
                   onClick={() => setShowJavaModal(true)}
                   className="text-slate-500 hover:text-indigo-600 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-200 hover:border-indigo-200 bg-slate-50"
                 >
                   <Code size={14} /> View Backend Code
                 </button>

                 <div className="w-px h-6 bg-slate-200 mx-1"></div>

                 <div className="flex items-center bg-slate-100 rounded-lg p-1">
                    <button 
                      onClick={() => setUseRealBrowser(false)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${!useRealBrowser ? 'bg-white shadow text-slate-700' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      <CloudOff size={14} /> Sim
                    </button>
                    <button 
                      onClick={() => setUseRealBrowser(true)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${useRealBrowser ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      <Monitor size={14} /> Real Browser
                    </button>
                 </div>

                 <button 
                  onClick={handleSave} 
                  disabled={isRunning}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ml-2 ${isRunning ? 'text-slate-400 bg-slate-50' : 'text-slate-600 bg-slate-100 hover:bg-slate-200'}`}
                >
                  <Save size={18} /> Save
                </button>
                <button 
                  onClick={runTest} 
                  disabled={isRunning}
                  className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors font-medium ${isRunning ? 'bg-amber-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                >
                  <Play size={18} /> {isRunning ? 'Running...' : 'Run Test'}
                </button>
              </div>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden">
              {/* Steps List */}
              <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                 <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-700">Test Steps</h3>
                    <button 
                      onClick={addStep} 
                      disabled={isRunning}
                      className={`text-sm font-medium flex items-center gap-1 ${isRunning ? 'text-slate-400' : 'text-indigo-600 hover:underline'}`}
                    >
                      <Plus size={16} /> Add Step
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                    {activeWorkflow.steps.length === 0 && (
                      <div className="text-center text-slate-400 py-10">No steps defined. Add a step to begin.</div>
                    )}
                    {activeWorkflow.steps.map((step, index) => (
                      <div 
                        key={step.id} 
                        draggable={!isRunning}
                        onDragStart={(e) => !isRunning && handleDragStart(e, index)}
                        onDragOver={(e) => !isRunning && handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        className={`bg-white p-4 rounded-lg shadow-sm border transition-all duration-200 group flex items-start gap-3 
                          ${draggedIndex === index ? 'border-indigo-400 bg-indigo-50 shadow-md ring-1 ring-indigo-200' : 'border-slate-200 hover:border-indigo-300'}
                          ${draggedIndex !== null && draggedIndex !== index ? 'opacity-60 blur-[0.5px]' : ''}
                          ${isRunning ? 'opacity-75 pointer-events-none' : ''}
                        `}
                      >
                        <div className={`mt-2 ${isRunning ? 'text-slate-200' : 'text-slate-300 cursor-grab active:cursor-grabbing hover:text-slate-500'}`}>
                          <GripVertical size={20} />
                        </div>
                        <div className="flex-1 grid grid-cols-12 gap-3">
                           <div className="col-span-3">
                              <label className="text-xs font-semibold text-slate-400 uppercase">Action</label>
                              <select 
                                value={step.operation}
                                onChange={(e) => updateStep(step.id, 'operation', e.target.value)}
                                className="w-full mt-1 p-2 border rounded bg-white text-sm focus:ring-1 focus:ring-indigo-500"
                              >
                                {Object.keys(OPS_DESCRIPTIONS).map(op => (
                                  <option key={op} value={op}>{OPS_DESCRIPTIONS[op as OperationType].label}</option>
                                ))}
                              </select>
                           </div>
                           <div className="col-span-4">
                             {(step.operation === 'CLICK' || step.operation === 'INPUT' || step.operation === 'ASSERT_TEXT') && (
                               <>
                                <label className="text-xs font-semibold text-slate-400 uppercase">Target Element</label>
                                <select 
                                  value={step.targetElementId || ''}
                                  onChange={(e) => updateStep(step.id, 'targetElementId', e.target.value)}
                                  className="w-full mt-1 p-2 border rounded bg-white text-sm focus:ring-1 focus:ring-indigo-500"
                                >
                                  <option value="" disabled>Select Element</option>
                                  {elements.map(el => (
                                    <option key={el.id} value={el.id}>{el.name}</option>
                                  ))}
                                </select>
                               </>
                             )}
                           </div>
                           <div className="col-span-4">
                              {(step.operation === 'INPUT' || step.operation === 'WAIT' || step.operation === 'ASSERT_TEXT' || step.operation === 'OPEN_URL') && (
                                <>
                                  <label className="text-xs font-semibold text-slate-400 uppercase">
                                    {step.operation === 'WAIT' ? 'Duration (ms)' : step.operation === 'ASSERT_TEXT' ? 'Expected Text' : step.operation === 'OPEN_URL' ? 'URL' : 'Input Value'}
                                  </label>
                                  <input 
                                    type="text" 
                                    value={step.value || ''}
                                    onChange={(e) => updateStep(step.id, 'value', e.target.value)}
                                    className="w-full mt-1 p-2 border rounded text-sm focus:ring-1 focus:ring-indigo-500"
                                    placeholder={
                                      step.operation === 'WAIT' ? '1000' : 
                                      step.operation === 'OPEN_URL' ? 'https://example.com' : 'Value...'
                                    }
                                  />
                                </>
                              )}
                           </div>
                           <div className="col-span-1 flex items-center justify-end h-full pt-4">
                              <button onClick={() => removeStep(step.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                                <Trash2 size={18} />
                              </button>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
              </div>

              {/* Console/Logs */}
              <div className="w-80 bg-slate-900 rounded-xl shadow-lg flex flex-col overflow-hidden">
                <div className="p-3 border-b border-slate-700 bg-slate-800 text-slate-300 text-sm font-semibold flex items-center gap-2">
                  <ChevronRight size={16} /> Execution Console
                </div>
                <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-1">
                  {executionLog.length === 0 ? (
                    <span className="text-slate-600 italic">Ready to run...</span>
                  ) : (
                    executionLog.map((log, i) => (
                      <div key={i} className={`${log.includes('Success') || log.includes('Backend received') ? 'text-green-400' : log.includes('PASSED') ? 'text-green-300 font-bold' : log.includes('FAILED') || log.includes('Error') ? 'text-red-400' : 'text-slate-300'}`}>
                        {log}
                      </div>
                    ))
                  )}
                  {isRunning && <div className="text-amber-400 animate-pulse">Processing...</div>}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            Select a workflow or create a new one to start.
          </div>
        )}
      </div>
    </div>
  );
};