import React from "react";

const Car: React.FC = () => {
  return (
    <div className="car-animation-container mb-8">
      <div className="car">
        <div className="car-body">
          <div className="car-top"></div>
          <div className="car-wheels">
            <div className="car-wheel car-wheel-left"></div>
            <div className="car-wheel car-wheel-right"></div>
          </div>
        </div>
        <div className="smoke"></div>
        <div className="smoke smoke-2"></div>
      </div>
      <style>{`
        .car-animation-container {
          position: relative;
          height: 100px;
          width: 100%;
          overflow: hidden;
        }
        .car {
          position: absolute;
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%);
          animation: drive 8s linear infinite;
        }
        .car-body {
          width: 100px;
          height: 40px;
          background: #e74c3c;
          border-radius: 10px;
          position: relative;
        }
        .car-top {
          width: 60px;
          height: 30px;
          background: #c0392b;
          position: absolute;
          top: -20px;
          left: 20px;
          border-radius: 8px 8px 0 0;
        }
        .car-wheels {
          position: absolute;
          bottom: -10px;
          width: 100%;
          display: flex;
          justify-content: space-between;
        }
        .car-wheel {
          width: 20px;
          height: 20px;
          background: #333;
          border-radius: 50%;
          border: 3px solid #666;
          animation: rotate 1s linear infinite;
        }
        .car-wheel-left {
          margin-left: 10px;
        }
        .car-wheel-right {
          margin-right: 10px;
        }
        .smoke {
          position: absolute;
          top: -20px;
          right: 0;
          width: 10px;
          height: 10px;
          background: rgba(200, 200, 200, 0.7);
          border-radius: 50%;
          animation: smoke 2s linear infinite;
        }
        .smoke-2 {
          animation-delay: 1s;
        }
        @keyframes drive {
          0% {
            left: -150px;
          }
          100% {
            left: calc(100% + 150px);
          }
        }
        @keyframes smoke {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-50px) scale(3);
          }
        }
        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default Car;
